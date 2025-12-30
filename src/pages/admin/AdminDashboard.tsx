import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, DollarSign, ShoppingCart, ArrowUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string | null;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      const parsedOrders = (data || []).map(order => ({
        ...order,
        items: order.items as unknown as OrderItem[]
      }));
      
      setOrders(parsedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from orders
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const orderCount = orders.length;

  const stats: Array<{
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: typeof DollarSign;
  }> = [
    {
      title: 'Total Revenue',
      value: `$${(totalRevenue / 100).toFixed(2)}`,
      change: '+0%',
      trend: 'neutral',
      icon: DollarSign,
    },
    {
      title: 'Orders',
      value: orderCount.toString(),
      change: '+0%',
      trend: 'neutral',
      icon: ShoppingCart,
    },
    {
      title: 'Products',
      value: '6',
      change: '0%',
      trend: 'neutral',
      icon: Package,
    },
    {
      title: 'Customers',
      value: new Set(orders.map(o => o.customer_name)).size.toString(),
      change: '+0%',
      trend: 'neutral',
      icon: Users,
    },
  ];

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

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-card rounded-2xl border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {stat.trend === 'up' && <ArrowUp className="h-4 w-4" />}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Recent Orders</h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
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
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground font-mono">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{order.customer_name || 'Guest'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {order.items.map(item => item.name).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
