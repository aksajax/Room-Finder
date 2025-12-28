import { motion } from 'framer-motion';
import { useAdminBookings, useUpdateBookingStatus } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-warning/10 text-warning' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-success/10 text-success' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-destructive/10 text-destructive' },
  { value: 'completed', label: 'Completed', color: 'bg-primary/10 text-primary' },
];

const AdminBookings = () => {
  const { toast } = useToast();
  const { data: bookings = [], isLoading } = useAdminBookings();
  const updateStatus = useUpdateBookingStatus();

  const handleStatusChange = async (id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({ title: `Booking ${status}` });
    } catch (error) {
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Bookings</h1>
        <p className="text-muted-foreground">{bookings.length} bookings total</p>
      </div>

      {/* Bookings Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Guest</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Room</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Check-in</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contact</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking: any) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-secondary/50"
                >
                  <td className="p-4">
                    <div className="font-medium text-foreground">{booking.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground">{booking.rooms?.title}</div>
                    <div className="text-xs text-muted-foreground">{booking.rooms?.location}</div>
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {new Date(booking.check_in_date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground">{booking.email}</div>
                    <div className="text-xs text-muted-foreground">{booking.phone}</div>
                  </td>
                  <td className="p-4 text-foreground font-medium">
                    ₹{booking.total_amount?.toLocaleString() || '—'}
                  </td>
                  <td className="p-4">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as any)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${
                        statusOptions.find(s => s.value === booking.status)?.color || ''
                      }`}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No bookings yet
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
