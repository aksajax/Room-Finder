import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Clock, Headphones, Building2, Users, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchFilters from '@/components/SearchFilters';
import RoomCard from '@/components/RoomCard';
import { useFeaturedRooms } from '@/hooks/useRooms';
import heroImage from '@/assets/hero-room.jpg';

const features = [
  { icon: Shield, title: 'Verified Properties', description: 'Every listing is verified for quality.' },
  { icon: Clock, title: 'Quick Booking', description: 'Book your room in just a few clicks.' },
  { icon: Headphones, title: '24/7 Support', description: 'Our team is always here to help.' },
];

const stats = [
  { value: '10K+', label: 'Happy Tenants', icon: Users },
  { value: '5K+', label: 'Properties', icon: Building2 },
  { value: '50+', label: 'Cities', icon: TrendingUp },
  { value: '4.8', label: 'Average Rating', icon: Award },
];

const Index = () => {
  const [filters, setFilters] = useState({ location: '', budget: '', roomType: '', search: '' });
  const { data: featuredRooms = [], isLoading } = useFeaturedRooms(6);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Modern apartment" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>

        <div className="container relative z-10 pt-20 pb-12">
          <div className="max-w-2xl">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block bg-primary/20 text-primary-foreground/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-primary-foreground/20">
              Find your perfect space
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6">
              Discover Rooms That Feel Like <span className="text-primary">Home</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-background/80 mb-8">
              From cozy studios to spacious apartments, find verified rental properties across major cities.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4">
              <Link to="/rooms"><Button variant="hero" size="xl">Explore Rooms <ArrowRight className="w-5 h-5" /></Button></Link>
              <Link to="/about"><Button variant="hero-outline" size="xl">Learn More</Button></Link>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12">
            <SearchFilters onFilter={setFilters} variant="hero" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Rooms</h2>
              <p className="text-muted-foreground">Handpicked properties that meet our highest standards.</p>
            </div>
            <Link to="/rooms"><Button variant="outline" className="group">View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Button></Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map((room, index) => (
                <RoomCard key={room.id} room={room} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to Find Your Perfect Room?</h2>
          <p className="text-primary-foreground/80 mb-8">Join thousands of happy tenants.</p>
          <Link to="/rooms"><Button size="xl" className="bg-background text-foreground hover:bg-background/90">Browse Rooms <ArrowRight className="w-5 h-5" /></Button></Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
