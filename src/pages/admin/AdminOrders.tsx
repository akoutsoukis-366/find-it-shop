import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Package, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mockOrders = [
  { id: '#12345', customer: 'John Doe', email: 'john@example.com', products: ['iTag Pro'], total: '$39.99', date: 'Dec 28, 2024', status: 'completed' },
  { id: '#12344', customer: 'Jane Smith', email: 'jane@example.com', products: ['iTag 4-Pack'], total: '$89.99', date: 'Dec 28, 2024', status: 'processing' },
  { id: '#12343', customer: 'Bob Wilson', email: 'bob@example.com', products: ['iTag Mini', 'iTag Pet'], total: '$54.98', date: 'Dec 27, 2024', status: 'shipped' },
  { id: '#12342', customer: 'Alice Brown', email: 'alice@example.com', products: ['iTag Ultra'], total: '$59.99', date: 'Dec 27, 2024', status: 'completed' },
  { id: '#12341', customer: 'Charlie Davis', email: 'charlie@example.com', products: ['iTag Pet'], total: '$29.99', date: 'Dec 26, 2024', status: 'cancelled' },
  { id: '#12340', customer: 'Diana Evans', email: 'diana@example.com', products: ['iTag Pro', 'iTag Mini'], total: '$64.98', date: 'Dec 26, 2024', status: 'completed' },
];

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = mockOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
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
                  <td className="px-6 py-4 font-medium text-foreground">{order.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-foreground">{order.customer}</div>
                      <div className="text-sm text-muted-foreground">{order.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {order.products.join(', ')}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{order.total}</td>
                  <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === 'processing' && (
                        <>
                          <Button variant="ghost" size="icon" className="text-success hover:text-success">
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
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

export default AdminOrders;
