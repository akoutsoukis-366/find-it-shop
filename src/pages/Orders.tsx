import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Loader2, Truck, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
  tracking_number: string | null;
  shipping_address: {
    name?: string;
    line1?: string;
    city?: string;
    country?: string;
  } | null;
}

const statusLabels: Record<string, string> = {
  completed: 'Ολοκληρώθηκε',
  processing: 'Σε Επεξεργασία',
  shipped: 'Απεστάλη',
  pending: 'Εκκρεμεί',
};

// Detect carrier from tracking number and return tracking URL
const detectCarrierAndGetUrl = (trackingNumber: string): { carrier: string; url: string } | null => {
  const cleaned = trackingNumber.replace(/\s/g, '').toUpperCase();
  if (/^(EL|RR|RA|RB|RC|RD|RE|RF|RG|RH|RI|RJ|RK|RL|RM|RN|RO|RP|RQ|RS|RT|RU|RV|RW|RX|RY|RZ|CP|CY|EE|EA|EB|EC|ED)\d{9}(GR|US|GB|DE)?$/.test(cleaned)) {
    return { carrier: 'ELTA', url: `https://itemsearch.elta.gr/el-GR/Query/Direct/${cleaned}` };
  }
  if (/^1Z[0-9A-Z]{16}$/.test(cleaned)) return { carrier: 'UPS', url: `https://www.ups.com/track?tracknum=${cleaned}` };
  if (/^\d{12}$|^\d{15}$|^\d{20}$/.test(cleaned)) return { carrier: 'FedEx', url: `https://www.fedex.com/fedextrack/?trknbr=${cleaned}` };
  if (/^\d{10}$/.test(cleaned)) return { carrier: 'DHL', url: `https://www.dhl.com/en/express/tracking.html?AWB=${cleaned}` };
  return { carrier: 'Tracking', url: `https://www.google.com/search?q=${encodeURIComponent('track ' + cleaned)}` };
};

const Orders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders((data || []).map(order => ({
          ...order,
          items: order.items as unknown as OrderItem[],
          shipping_address: order.shipping_address as Order['shipping_address'],
        })));
      }

      setLoading(false);
    };

    checkAuthAndFetchOrders();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success';
      case 'processing':
        return 'bg-warning/20 text-warning';
      case 'shipped':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Πίσω στην Αρχική
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">Οι Παραγγελίες μου</h1>
          <p className="text-muted-foreground mb-8">Δείτε το ιστορικό παραγγελιών και παρακολουθήστε τις αποστολές σας</p>

          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-12 text-center"
            >
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Δεν υπάρχουν παραγγελίες ακόμα</h2>
              <p className="text-muted-foreground mb-6">Ξεκινήστε τις αγορές σας για να δείτε τις παραγγελίες εδώ.</p>
              <Link to="/products">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Περιήγηση Προϊόντων
                </button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                  <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Ημερομηνία</p>
                      <p className="font-medium text-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Σύνολο</p>
                      <p className="font-medium text-foreground">{formatPrice(order.total / 100)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Κωδικός Παραγγελίας</p>
                      <p className="font-mono text-sm text-foreground">{order.id.slice(0, 8)}...</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    {order.tracking_number && (
                      <div className="mb-6 pb-6 border-b border-border">
                        <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Παρακολούθηση Αποστολής
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-sm text-foreground bg-muted px-3 py-1.5 rounded-lg">
                            {order.tracking_number}
                          </span>
                          {(() => {
                            const info = detectCarrierAndGetUrl(order.tracking_number!);
                            return info ? (
                              <a
                                href={info.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                              >
                                Παρακολούθηση στον {info.carrier}
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    )}

                    <h3 className="font-medium text-foreground mb-4">Προϊόντα</h3>
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-foreground">{formatPrice(item.price / 100)}</span>
                        </div>
                      ))}
                    </div>

                    {order.shipping_address && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h3 className="font-medium text-foreground mb-2">Αποστολή σε</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.shipping_address.name && <span className="block">{order.shipping_address.name}</span>}
                          {order.shipping_address.line1 && <span className="block">{order.shipping_address.line1}</span>}
                          {order.shipping_address.city && order.shipping_address.country && (
                            <span className="block">{order.shipping_address.city}, {order.shipping_address.country}</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;