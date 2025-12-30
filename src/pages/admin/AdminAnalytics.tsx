import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';

const AdminAnalytics = () => {
  const chartData = [
    { month: 'Jul', revenue: 12000 },
    { month: 'Aug', revenue: 19000 },
    { month: 'Sep', revenue: 15000 },
    { month: 'Oct', revenue: 22000 },
    { month: 'Nov', revenue: 28000 },
    { month: 'Dec', revenue: 45000 },
  ];

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  const topProducts = [
    { name: 'iTag 4-Pack', sales: 234, revenue: '$21,041.66' },
    { name: 'iTag Pro', sales: 189, revenue: '$7,558.11' },
    { name: 'iTag Pet', sales: 156, revenue: '$4,678.44' },
    { name: 'iTag Ultra', sales: 98, revenue: '$5,879.02' },
    { name: 'iTag Mini', sales: 87, revenue: '$2,174.13' },
  ];

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
          <div className="flex items-center gap-2 text-success">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">+60.8% from last period</span>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between gap-4 h-64">
          {chartData.map((data, index) => (
            <motion.div
              key={data.month}
              initial={{ height: 0 }}
              animate={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div
                className="w-full rounded-t-lg gradient-primary hover:shadow-glow transition-shadow cursor-pointer"
                style={{ height: '100%' }}
              />
              <span className="text-sm text-muted-foreground">{data.month}</span>
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
                  <div className="font-semibold text-foreground">{product.revenue}</div>
                </div>
              </div>
            ))}
          </div>
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
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
                <div className="text-2xl font-bold text-foreground">3.42%</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Average Order Value</div>
                <div className="text-2xl font-bold text-foreground">$52.34</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Customer Lifetime Value</div>
                <div className="text-2xl font-bold text-foreground">$245.89</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
