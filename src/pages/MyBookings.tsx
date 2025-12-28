import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';

const MyBookings = () => {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useUserBookings();

  if (!user) {
    return (
      <div className="min-h-screen pt-16 bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please login to view bookings</h1>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-background">
      <section className="bg-secondary py-12">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              {bookings?.length ? `You have ${bookings.length} booking(s)` : 'No bookings yet'}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {bookings?.length ? (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card rounded-xl border border-border p-6 flex flex-col md:flex-row gap-6"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {booking.rooms?.title || 'Room Booking'}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.check_in_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {booking.rooms?.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-success/10 text-success' :
                      booking.status === 'pending' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="font-semibold text-foreground">
                      ₹{booking.total_amount?.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">Start exploring rooms to make your first booking!</p>
              <Link to="/rooms">
                <Button variant="hero">Browse Rooms</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyBookings;
