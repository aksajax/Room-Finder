import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoomCard from '@/components/RoomCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRooms } from '@/hooks/useRooms';

const WishlistPage = () => {
  const { wishlist } = useWishlist();
  const { data: rooms = [] } = useRooms();
  
  const wishlistRooms = rooms.filter(room => wishlist.includes(room.id));

  return (
    <div className="min-h-screen pt-16 bg-background">
      <section className="bg-secondary py-12">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-accent fill-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">My Wishlist</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {wishlistRooms.length > 0 ? `You have ${wishlistRooms.length} saved room(s)` : 'Your wishlist is empty'}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {wishlistRooms.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistRooms.map((room, index) => (
                <RoomCard key={room.id} room={room} index={index} />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No saved rooms yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start exploring rooms and save your favorites by clicking the heart icon.
              </p>
              <Link to="/rooms"><Button variant="hero" size="lg">Browse Rooms</Button></Link>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WishlistPage;
