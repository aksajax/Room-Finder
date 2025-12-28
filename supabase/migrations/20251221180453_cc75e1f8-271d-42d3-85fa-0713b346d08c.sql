-- Add policy for admins to insert rooms
CREATE POLICY "Admins can insert rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add policy for admins to delete rooms
CREATE POLICY "Admins can delete rooms"
  ON public.rooms FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add policy for admins to update bookings
CREATE POLICY "Admins can update all bookings"
  ON public.bookings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));