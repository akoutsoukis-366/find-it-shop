import { motion } from 'framer-motion';
import { Package, Users, DollarSign, TrendingUp, ShoppingCart, ArrowUp, ArrowDown } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Orders',
      value: '1,234',
      change: '+15.3%',
      trend: 'up',
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
      value: '892',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
    },
  ];

  const recentOrders = [
    { id: '#12345', customer: 'John Doe', product: 'iTag Pro', amount: '$39.99', status: 'Completed' },
    { id: '#12344', customer: 'Jane Smith', product: 'iTag 4-Pack', amount: '$89.99', status: 'Processing' },
    { id: '#12343', customer: 'Bob Wilson', product: 'iTag Mini', amount: '$24.99', status: 'Shipped' },
    { id: '#12342', customer: 'Alice Brown', product: 'iTag Ultra', amount: '$59.99', status: 'Completed' },
    { id: '#12341', customer: 'Charlie Davis', product: 'iTag Pet', amount: '$29.99', status: 'Processing' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-success/20 text-success';
      case 'Processing':
        return 'bg-warning/20 text-warning';
      case 'Shipped':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

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
                {stat.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : stat.trend === 'down' ? <ArrowDown className="h-4 w-4" /> : null}
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{order.product}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
