import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import SearchFilters from '@/components/SearchFilters';
import RoomCard from '@/components/RoomCard';
import { useRooms } from '@/hooks/useRooms';

const budgetRanges = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { label: '₹2,000 - ₹3,500', min: 2000, max: 3500 },
  { label: '₹3,500 - ₹5,000', min: 3500, max: 5000 },
  { label: 'Above ₹5,000', min: 5000, max: Infinity },
];

const RoomsPage = () => {
  const { data: rooms = [], isLoading } = useRooms();
  const [filters, setFilters] = useState({
    location: '',
    budget: '',
    roomType: '',
    search: '',
  });

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !room.title.toLowerCase().includes(searchLower) &&
          !(room.description?.toLowerCase().includes(searchLower)) &&
          !room.location.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      if (filters.location && room.city !== filters.location) {
        return false;
      }

      if (filters.roomType && room.room_type !== filters.roomType) {
        return false;
      }

      if (filters.budget) {
        const budgetRange = budgetRanges.find(b => b.label === filters.budget);
        if (budgetRange) {
          if (room.price_per_month < budgetRange.min || room.price_per_month > budgetRange.max) {
            return false;
          }
        }
      }

      return true;
    });
  }, [rooms, filters]);

  return (
    <div className="min-h-screen pt-16 bg-background">
      <section className="bg-secondary py-12 md:py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Browse Available Rooms</h1>
            <p className="text-muted-foreground text-lg">
              Explore our collection of verified rental properties.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8">
            <SearchFilters onFilter={setFilters} variant="page" />
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredRooms.length}</span> rooms
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room, index) => (
                <RoomCard key={room.id} room={room} index={index} />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🏠</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No rooms found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters.</p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RoomsPage;
