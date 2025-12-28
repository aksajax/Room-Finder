import { Link } from 'react-router-dom';
import { Star, MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { motion } from 'framer-motion';
import { Room } from '@/hooks/useRooms';

interface RoomCardProps {
  room: Room;
  index?: number;
}

const RoomCard = ({ room, index = 0 }: RoomCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(room.id);
  const image = room.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50"
    >
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(room.id);
          }}
          className="absolute top-3 right-3 w-9 h-9 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-accent text-accent' : 'text-muted-foreground'
            }`}
          />
        </button>

        {/* Room Type Badge */}
        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
          {room.room_type}
        </span>

        {/* Price Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-4 pt-8">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-background">₹{room.price_per_month.toLocaleString()}</span>
            <span className="text-background/80 text-sm">/month</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="font-medium text-foreground">{room.rating}</span>
            <span className="text-muted-foreground">({room.review_count} reviews)</span>
          </div>
          {room.area_sqft && (
            <span className="text-xs text-muted-foreground">{room.area_sqft} sq ft</span>
          )}
        </div>

        <h3 className="font-semibold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
          {room.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{room.location}, {room.city}</span>
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {room.amenities.slice(0, 3).map(amenity => (
              <span
                key={amenity}
                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        <Link to={`/room/${room.id}`}>
          <Button className="w-full mt-2" variant="default">
            Book Now
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default RoomCard;
