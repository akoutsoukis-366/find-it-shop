import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, CreditCard, Settings, ArrowLeft, BarChart3, LogOut, Loader2, MessageSquare, FolderOpen, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useContentSettings } from '@/hooks/useContentSettings';

const AdminLayout = () => {
  const { content } = useContentSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/admin/login');
        return;
      }

      setUser(session.user);

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        toast.error('You do not have admin access');
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      const { data: darkModeSetting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'dark_mode')
        .maybeSingle();

      if (darkModeSetting?.value === 'false') {
        setIsDarkMode(false);
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdminAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings',
          filter: 'key=eq.dark_mode',
        },
        (payload) => {
          const newValue = (payload.new as { value: string | null }).value;
          setIsDarkMode(newValue !== 'false');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);
      setUnreadMessages(count || 0);
    };

    fetchUnread();

    const channel = supabase
      .channel('admin-contact-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_messages' },
        () => fetchUnread()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: FolderOpen, label: 'Categories', path: '/admin/categories' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CreditCard, label: 'Orders', path: '/admin/orders' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages', badge: 'messages' as const },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const sidebarContent = (
    <>
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {content.logo_url ? (
            <img src={content.logo_url} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">{content.store_name?.substring(0, 2) || ''}</span>
            </div>
          )}
          <span className="text-lg md:text-xl font-bold text-foreground truncate">{content.store_name || ''} Admin</span>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-colors text-sm md:text-base',
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge === 'messages' && unreadMessages > 0 && (
              <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold animate-pulse">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-3 md:p-4 border-t border-border space-y-1 md:space-y-2">
        {user && (
          <div className="px-3 md:px-4 py-2 text-xs md:text-sm text-muted-foreground truncate">
            {user.email}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-sm md:text-base"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-sm md:text-base"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          Back to Store
        </Link>
      </div>
    </>
  );

  return (
    <div className={cn("min-h-screen bg-background flex", !isDarkMode && "admin-light")}
         style={!isDarkMode ? { background: 'hsl(0, 0%, 96%)' } : undefined}>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => setSidebarOpen(true)} className="p-1 text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-bold text-foreground truncate">{content.store_name || ''} Admin</span>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
