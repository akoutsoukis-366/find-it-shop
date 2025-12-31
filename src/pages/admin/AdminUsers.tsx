import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Ban, Trash2, CheckCircle, Clock, Loader2, Eye, Package, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface UserOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
  shipping_address: ShippingAddress | null;
  tracking_number: string | null;
  customer_email: string | null;
  customer_name: string | null;
}

interface UserProfile {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
}

interface UserData {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  full_name: string | null;
  orders_count: number;
  total_spent: number;
}

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: UserData | null }>({
    open: false,
    user: null,
  });
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedUserStats, setSelectedUserStats] = useState<{ orders_count: number; total_spent: number; email_confirmed_at: string | null } | null>(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState<UserOrder[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, created_at');

      if (profilesError) throw profilesError;

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total');

      if (ordersError) throw ordersError;

      const orderStats = (orders || []).reduce((acc, order) => {
        if (order.user_id) {
          if (!acc[order.user_id]) {
            acc[order.user_id] = { count: 0, total: 0 };
          }
          acc[order.user_id].count += 1;
          acc[order.user_id].total += order.total || 0;
        }
        return acc;
      }, {} as Record<string, { count: number; total: number }>);

      const { data: authData } = await supabase.functions.invoke('get-users-auth-status', {
        body: { userIds: profiles?.map(p => p.user_id) || [] }
      });

      const authStatusMap = (authData?.users || []).reduce((acc: Record<string, { email_confirmed_at: string | null }>, u: any) => {
        acc[u.id] = { email_confirmed_at: u.email_confirmed_at };
        return acc;
      }, {});

      const usersData: UserData[] = (profiles || []).map(profile => ({
        id: profile.user_id,
        email: profile.email || 'No email',
        email_confirmed_at: authStatusMap[profile.user_id]?.email_confirmed_at || null,
        created_at: profile.created_at,
        full_name: profile.full_name,
        orders_count: orderStats[profile.user_id]?.count || 0,
        total_spent: orderStats[profile.user_id]?.total || 0,
      }));

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = async (user: UserData) => {
    setDetailLoading(true);
    setDetailDialogOpen(true);
    setSelectedUserOrders([]);
    setSelectedUserStats({
      orders_count: user.orders_count,
      total_spent: user.total_spent,
      email_confirmed_at: user.email_confirmed_at,
    });

    try {
      // Fetch profile and orders in parallel
      const [profileResult, ordersResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (profileResult.error) throw profileResult.error;
      if (ordersResult.error) throw ordersResult.error;
      
      setSelectedUser(profileResult.data);
      
      // Parse orders data
      const parsedOrders: UserOrder[] = (ordersResult.data || []).map(order => ({
        ...order,
        items: order.items as unknown as OrderItem[],
        shipping_address: order.shipping_address as unknown as ShippingAddress | null
      }));
      setSelectedUserOrders(parsedOrders);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
      setDetailDialogOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewOrder = (order: UserOrder) => {
    setSelectedOrder(order);
    setOrderDetailDialogOpen(true);
  };

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

  const handleResendVerification = async (user: UserData) => {
    setActionLoading(user.id);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-actions', {
        body: { action: 'resend_verification', email: user.email }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to resend verification');
      }

      toast.success(`Verification email sent to ${user.email}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (user: UserData) => {
    setActionLoading(user.id);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-actions', {
        body: { action: 'ban_user', userId: user.id }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to ban user');
      }

      toast.success(`User ${user.email} has been banned`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to ban user';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    const user = deleteDialog.user;
    if (!user) return;

    setActionLoading(user.id);
    setDeleteDialog({ open: false, user: null });

    try {
      const { data, error } = await supabase.functions.invoke('admin-user-actions', {
        body: { action: 'delete_user', userId: user.id }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to delete user');
      }

      toast.success(`User ${user.email} has been deleted`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage your customer accounts ({users.length} total)</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Orders</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Total Spent</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Email Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {searchQuery ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                          <span className="text-primary-foreground font-semibold">
                            {user.full_name 
                              ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                              : user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.full_name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">{user.orders_count}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{formatCurrency(user.total_spent)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4">
                      {user.email_confirmed_at ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="View user details"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!user.email_confirmed_at && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Resend verification email"
                            onClick={() => handleResendVerification(user)}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Ban user"
                          onClick={() => handleBanUser(user)}
                          disabled={actionLoading === user.id}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive" 
                          title="Delete user"
                          onClick={() => setDeleteDialog({ open: true, user })}
                          disabled={actionLoading === user.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: open ? deleteDialog.user : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.user?.email}? This action cannot be undone and will remove all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete profile information
            </DialogDescription>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedUser && (
            <div className="space-y-6">
              {/* Status & Stats */}
              <div className="flex items-center justify-between">
                {selectedUserStats?.email_confirmed_at ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-success/20 text-success">
                    <CheckCircle className="h-4 w-4" />
                    Email Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-warning/20 text-warning">
                    <Clock className="h-4 w-4" />
                    Email Pending Verification
                  </span>
                )}
                <div className="text-sm text-muted-foreground">
                  Joined: {formatDate(selectedUser.created_at)}
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Full Name</div>
                    <div className="font-medium text-foreground">{selectedUser.full_name || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium text-foreground">{selectedUser.email || 'No email'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div className="font-medium text-foreground">{selectedUser.phone || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">User ID</div>
                    <div className="font-medium text-foreground font-mono text-xs">{selectedUser.user_id}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Shipping Address</h3>
                <div className="text-sm space-y-1">
                  {selectedUser.address_line1 ? (
                    <>
                      <div className="font-medium text-foreground">{selectedUser.address_line1}</div>
                      {selectedUser.address_line2 && (
                        <div className="text-muted-foreground">{selectedUser.address_line2}</div>
                      )}
                      <div className="text-muted-foreground">
                        {[selectedUser.city, selectedUser.state, selectedUser.postal_code]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                      <div className="text-muted-foreground">{selectedUser.country}</div>
                    </>
                  ) : (
                    <div className="text-muted-foreground">No address provided</div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Order Statistics */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Order Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-foreground">{selectedUserStats?.orders_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(selectedUserStats?.total_spent || 0)}</div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order History */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Order History</h3>
                {selectedUserOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {selectedUserOrders.map((order) => (
                        <div 
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-foreground">
                                #{order.id.slice(0, 8)}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDate(order.created_at)} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-foreground">
                              {formatCurrency(order.total)}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewOrder(order)}
                              title="View order details"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={orderDetailDialogOpen} onOpenChange={setOrderDetailDialogOpen}>
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
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Total */}
              <div className="flex justify-between font-semibold text-base">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
