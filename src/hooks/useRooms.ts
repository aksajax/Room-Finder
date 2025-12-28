import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Room = Tables<'rooms'>;

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Room[];
    },
  });
};

export const useRoom = (id: string) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Room | null;
    },
    enabled: !!id,
  });
};

export const useFeaturedRooms = (limit: number = 6) => {
  return useQuery({
    queryKey: ['featured-rooms', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Room[];
    },
  });
};
