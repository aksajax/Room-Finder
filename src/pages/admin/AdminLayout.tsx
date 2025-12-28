import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  ArrowLeft,
  Shield,
  Tag,
} from 'lucide-react';

import { useIsAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/rooms', label: 'Rooms', icon: Building2 },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/usermanagement', label: 'User Management', icon: Shield },
];

const AdminLayout = () => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  /* Loading */
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-secondary">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* Not logged in */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* Not admin */
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-secondary">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You don&apos;t have permission to access the admin panel.
          </p>
          <Link to="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-secondary">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-4rem)] bg-card border-r border-border p-4 hidden md:block">
          <div className="mb-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Site
            </Link>
          </div>

          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Admin Panel
          </h2>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-40">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
