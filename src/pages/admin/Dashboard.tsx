import { motion } from 'framer-motion';
import { Building2, CalendarCheck, Users, TrendingUp } from 'lucide-react';
import { useAdminRooms, useAdminBookings } from '@/hooks/useAdmin';

const Dashboard = () => {
  const { data: rooms = [] } = useAdminRooms();
  const { data: bookings = [] } = useAdminBookings();

  const stats = [
    {
      label: 'Total Rooms',
      value: rooms.length,
      icon: Building2,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Total Bookings',
      value: bookings.length,
      icon: CalendarCheck,
      color: 'bg-success/10 text-success',
    },
    {
      label: 'Pending Bookings',
      value: bookings.filter((b: any) => b.status === 'pending').length,
      icon: Users,
      color: 'bg-warning/10 text-warning',
    },
    {
      label: 'Confirmed',
      value: bookings.filter((b: any) => b.status === 'confirmed').length,
      icon: TrendingUp,
      color: 'bg-accent/10 text-accent',
    },
  ];

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your room rental business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Bookings</h2>
        </div>
        <div className="divide-y divide-border">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking: any) => (
              <div key={booking.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{booking.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {booking.rooms?.title} • {new Date(booking.check_in_date).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'confirmed' ? 'bg-success/10 text-success' :
                  booking.status === 'pending' ? 'bg-warning/10 text-warning' :
                  booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No bookings yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
