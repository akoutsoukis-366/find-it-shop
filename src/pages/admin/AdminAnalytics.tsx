import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingCart, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface ProductSales {
  name: string;
  sales: number;
  revenue: number;
}

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<MonthlyRevenue[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orderCount: 0,
    avgOrderValue: 0,
    previousPeriodRevenue: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all orders
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('id, total, created_at, items')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedOrders: Order[] = (ordersData || []).map(order => ({
        ...order,
        items: (order.items as unknown as OrderItem[]) || []
      }));

      setOrders(typedOrders);

      // Calculate monthly revenue for last 6 months
      const monthlyData: MonthlyRevenue[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthRevenue = typedOrders
          .filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= monthStart && orderDate <= monthEnd;
          })
          .reduce((sum, order) => sum + (order.total / 100), 0);

        monthlyData.push({
          month: format(monthDate, 'MMM'),
          revenue: monthRevenue,
        });
      }
      setChartData(monthlyData);

      // Calculate current period (last 3 months) vs previous period
      const currentPeriodStart = subMonths(now, 3);
      const previousPeriodStart = subMonths(now, 6);
      
      const currentPeriodRevenue = typedOrders
        .filter(order => new Date(order.created_at) >= currentPeriodStart)
        .reduce((sum, order) => sum + order.total, 0);

      const previousPeriodRevenue = typedOrders
        .filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= previousPeriodStart && orderDate < currentPeriodStart;
        })
        .reduce((sum, order) => sum + order.total, 0);

      // Calculate top products
      const productSalesMap = new Map<string, { sales: number; revenue: number }>();
      
      typedOrders.forEach(order => {
        order.items.forEach(item => {
          const existing = productSalesMap.get(item.name) || { sales: 0, revenue: 0 };
          productSalesMap.set(item.name, {
            sales: existing.sales + item.quantity,
            revenue: existing.revenue + (item.price * item.quantity),
          });
        });
      });

      const sortedProducts = Array.from(productSalesMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopProducts(sortedProducts);

      // Calculate overall stats
      const totalRevenue = typedOrders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = typedOrders.length;
      const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

      setStats({
        totalRevenue: totalRevenue / 100,
        orderCount,
        avgOrderValue: avgOrderValue / 100,
        previousPeriodRevenue: previousPeriodRevenue / 100,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getGrowthPercentage = () => {
    if (stats.previousPeriodRevenue === 0) return stats.totalRevenue > 0 ? 100 : 0;
    const currentPeriodRevenue = chartData.slice(-3).reduce((sum, m) => sum + m.revenue, 0);
    const previousPeriodRevenue = chartData.slice(0, 3).reduce((sum, m) => sum + m.revenue, 0);
    if (previousPeriodRevenue === 0) return currentPeriodRevenue > 0 ? 100 : 0;
    return ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;
  };

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const growthPercentage = getGrowthPercentage();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Track your store performance</p>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Revenue Overview</h2>
            <p className="text-muted-foreground">Last 6 months</p>
          </div>
          <div className={`flex items-center gap-2 ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 ${growthPercentage < 0 ? 'rotate-180' : ''}`} />
            <span className="font-medium">
              {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}% from last period
            </span>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between gap-4 h-64">
          {chartData.map((data, index) => (
            <motion.div
              key={data.month}
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full flex-1 flex flex-col justify-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  className="w-full rounded-t-lg gradient-primary hover:shadow-glow transition-shadow cursor-pointer min-h-[4px]"
                  title={formatCurrency(data.revenue)}
                />
              </div>
              <span className="text-sm text-muted-foreground">{data.month}</span>
              <span className="text-xs text-muted-foreground">{formatCurrency(data.revenue)}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-6">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.sales} sales</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{formatPrice(product.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
                <div className="text-2xl font-bold text-foreground">{stats.orderCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Average Order Value</div>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.avgOrderValue)}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
