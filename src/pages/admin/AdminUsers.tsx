import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreHorizontal, Mail, Ban, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', orders: 5, spent: '$199.95', joined: 'Dec 15, 2024', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', orders: 12, spent: '$549.88', joined: 'Nov 22, 2024', status: 'active' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', orders: 3, spent: '$89.97', joined: 'Dec 01, 2024', status: 'active' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', orders: 8, spent: '$319.92', joined: 'Oct 10, 2024', status: 'inactive' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', orders: 2, spent: '$69.98', joined: 'Dec 20, 2024', status: 'active' },
];

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users Table */}
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
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground">{user.orders}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{user.spent}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.joined}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default AdminUsers;
