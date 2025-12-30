import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Loader2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface Order {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number | null;
  created_at: string;
  updated_at: string;
  status: string;
  tracking_number: string | null;
  shipping_address: ShippingAddress | null;
  currency: string | null;
  stripe_session_id: string | null;
}

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [pendingShipment, setPendingShipment] = useState<{ orderId: string; order: Order } | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsedOrders = (data || []).map(order => ({
        ...order,
        items: order.items as unknown as OrderItem[],
        shipping_address: order.shipping_address as unknown as ShippingAddress | null
      }));
      
      setOrders(parsedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (newStatus === 'shipped') {
      setPendingShipment({ orderId, order });
      setTrackingNumber(order.tracking_number || '');
      setTrackingDialogOpen(true);
      return;
    }

    await updateOrderStatus(orderId, newStatus, order);
  };

  const handleConfirmShipment = async () => {
    if (!pendingShipment) return;
    
    await updateOrderStatus(
      pendingShipment.orderId, 
      'shipped', 
      pendingShipment.order, 
      trackingNumber.trim() || undefined
    );
    
    setTrackingDialogOpen(false);
    setPendingShipment(null);
    setTrackingNumber('');
  };

  const updateOrderStatus = async (
    orderId: string, 
    newStatus: string, 
    order: Order,
    trackingNum?: string
  ) => {
    try {
      const updateData: { status: string; tracking_number?: string } = { status: newStatus };
      if (trackingNum !== undefined) {
        updateData.tracking_number = trackingNum;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(o => 
        o.id === orderId 
          ? { ...o, status: newStatus, tracking_number: trackingNum ?? o.tracking_number } 
          : o
      ));
      
      toast.success(`Order status updated to ${newStatus}`);

      if (newStatus === 'shipped' || newStatus === 'delivered') {
        try {
          await supabase.functions.invoke('send-order-status-email', {
            body: {
              customerEmail: order.customer_email,
              customerName: order.customer_name,
              orderId: order.id,
              status: newStatus,
              items: order.items,
              trackingNumber: trackingNum || order.tracking_number,
            },
          });
          toast.success('Customer notification sent');
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.customer_email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.tracking_number?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-success/20 text-success';
      case 'processing':
        return 'bg-warning/20 text-warning';
      case 'shipped':
        return 'bg-primary/20 text-primary';
      case 'cancelled':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatAddress = (address: ShippingAddress | null): string[] => {
    if (!address) return ['No shipping address'];
    const parts = [
      address.line1,
      address.line2,
      [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
      address.country
    ].filter(Boolean) as string[];
    return parts.length > 0 ? parts : ['No shipping address'];
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Orders will appear here after customers complete checkout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Products</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground font-mono text-sm">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{order.customer_name || 'Guest'}</div>
                        <div className="text-sm text-muted-foreground">{order.customer_email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                      {order.items.map(item => `${item.name} (×${item.quantity})`).join(', ')}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Tracking Number Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tracking Number</DialogTitle>
            <DialogDescription>
              Enter the tracking number for this shipment. This will be included in the customer's email notification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter tracking number (optional)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmShipment}>
              Mark as Shipped
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status & Dates */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <div className="text-sm text-muted-foreground">
                  Ordered: {formatDateTime(selectedOrder.created_at)}
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium text-foreground">{selectedOrder.customer_name || 'Guest'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium text-foreground">{selectedOrder.customer_email || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Shipping Address</h3>
                <div className="text-sm">
                  {formatAddress(selectedOrder.shipping_address).map((line, i) => (
                    <div key={i} className={i === 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.tracking_number && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Tracking</h3>
                    <div className="font-mono text-sm bg-secondary/50 px-3 py-2 rounded-lg">
                      {selectedOrder.tracking_number}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-muted-foreground"> × {item.quantity}</span>
                      </div>
                      <div className="font-medium text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{formatPrice(selectedOrder.shipping || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {selectedOrder.stripe_session_id && (
                <div className="text-xs text-muted-foreground">
                  Payment ID: {selectedOrder.stripe_session_id}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
