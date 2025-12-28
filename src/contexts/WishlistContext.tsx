import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch wishlist from database when user is logged in
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      // Load from localStorage for non-logged in users
      const saved = localStorage.getItem('roomWishlist');
      setWishlist(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('wishlists')
      .select('room_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching wishlist:', error);
    } else {
      setWishlist(data.map(item => item.room_id));
    }
    setIsLoading(false);
  };

  const addToWishlist = async (id: string) => {
    if (user) {
      // Save to database
      const { error } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, room_id: id });

      if (error) {
        if (error.code === '23505') {
          // Already exists
          toast({ title: 'Already in wishlist' });
        } else {
          toast({ title: 'Error adding to wishlist', variant: 'destructive' });
        }
        return;
      }
    } else {
      // Save to localStorage
      const updated = [...wishlist, id];
      localStorage.setItem('roomWishlist', JSON.stringify(updated));
    }
    
    setWishlist(prev => [...prev, id]);
    toast({ title: 'Added to wishlist' });
  };

  const removeFromWishlist = async (id: string) => {
    if (user) {
      // Remove from database
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('room_id', id);

      if (error) {
        toast({ title: 'Error removing from wishlist', variant: 'destructive' });
        return;
      }
    } else {
      // Remove from localStorage
      const updated = wishlist.filter(item => item !== id);
      localStorage.setItem('roomWishlist', JSON.stringify(updated));
    }
    
    setWishlist(prev => prev.filter(item => item !== id));
    toast({ title: 'Removed from wishlist' });
  };

  const isInWishlist = (id: string) => wishlist.includes(id);

  const toggleWishlist = (id: string) => {
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
