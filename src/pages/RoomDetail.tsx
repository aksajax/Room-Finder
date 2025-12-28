import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  Heart,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Wind,
  Tv,
  Car,
  Dumbbell,
  Shield,
  Droplets,
  Utensils,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoom } from '@/hooks/useRooms';
import { useWishlist } from '@/contexts/WishlistContext';
import BookingForm from '@/components/BookingForm';

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  AC: Wind,
  TV: Tv,
  'Smart TV': Tv,
  Parking: Car,
  'Valet Parking': Car,
  Gym: Dumbbell,
  'Gym Access': Dumbbell,
  Security: Shield,
  '24/7 Security': Shield,
  'Hot Water': Droplets,
  Kitchen: Utensils,
  'Common Kitchen': Utensils,
  'Premium Kitchen': Utensils,
  'Modular Kitchen': Utensils,
};

const RoomDetail = () => {
  const { id } = useParams();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { data: room, isLoading, error } = useRoom(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Room Not Found</h1>
          <Link to="/rooms">
            <Button>Back to Rooms</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = isInWishlist(room.id);
  const images = room.images || ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'];
  const amenities = room.amenities || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen pt-16 bg-background">
      {/* Back Button */}
      <div className="container py-4">
        <Link to="/rooms" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Rooms
        </Link>
      </div>

      {/* Gallery */}
      <section className="container mb-8">
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={images[currentImageIndex]}
            alt={room.title}
            className="w-full h-full object-cover"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-card transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-card transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-background w-6'
                        : 'bg-background/50 hover:bg-background/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(room.id)}
              className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-card transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? 'fill-accent text-accent' : 'text-foreground'}`}
              />
            </button>
            <button className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-card transition-colors">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full">
            {room.room_type}
          </span>
        </div>
      </section>

      {/* Content */}
      <section className="container pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="w-4 h-4" />
                {room.location}, {room.city}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{room.title}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <span className="font-semibold text-foreground">{room.rating}</span>
                  <span className="text-muted-foreground">({room.review_count} reviews)</span>
                </div>
                {room.area_sqft && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{room.area_sqft} sq.ft</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">About This Room</h2>
              <p className="text-muted-foreground leading-relaxed">{room.description}</p>
            </div>

            {amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {amenities.map(amenity => {
                    const Icon = amenityIcons[amenity] || Check;
                    return (
                      <div key={amenity} className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-card rounded-2xl shadow-card border border-border p-6">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-foreground">
                  ₹{room.price_per_month.toLocaleString()}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                or ₹{room.price_per_day.toLocaleString()}/day
              </p>

              <Button onClick={() => setIsBookingOpen(true)} variant="hero" size="lg" className="w-full mb-3">
                Book Now
              </Button>

              <Button onClick={() => toggleWishlist(room.id)} variant="outline" size="lg" className="w-full">
                <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-accent text-accent' : ''}`} />
                {isWishlisted ? 'Saved' : 'Save to Wishlist'}
              </Button>

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-success" />
                  Free cancellation within 24 hours
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-success" />
                  Verified property
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingForm room={room} isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
};

export default RoomDetail;
