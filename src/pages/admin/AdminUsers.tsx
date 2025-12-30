import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Ban, Trash2, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles with order stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, created_at');

      if (profilesError) throw profilesError;

      // Fetch orders to calculate stats per user
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total');

      if (ordersError) throw ordersError;

      // Calculate order stats per user
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

      // Fetch user verification status from auth (via edge function or admin API)
      // For now, we'll use a simplified approach - checking if email is confirmed
      // by calling the edge function that can access auth.users
      const { data: authData, error: authError } = await supabase.functions.invoke('get-users-auth-status', {
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
      // Fallback: just show profiles without auth status
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email, full_name, created_at');

        const { data: orders } = await supabase
          .from('orders')
          .select('user_id, total');

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

        const usersData: UserData[] = (profiles || []).map(profile => ({
          id: profile.user_id,
          email: profile.email || 'No email',
          email_confirmed_at: null, // Unknown without auth data
          created_at: profile.created_at,
          full_name: profile.full_name,
          orders_count: orderStats[profile.user_id]?.count || 0,
          total_spent: orderStats[profile.user_id]?.total || 0,
        }));

        setUsers(usersData);
      } catch (e) {
        toast.error('Failed to load users');
      }
    } finally {
      setIsLoading(false);
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
                        <Button variant="ghost" size="icon" title="Send email">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Ban user">
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete user">
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
    </div>
  );
};

export default AdminUsers;