import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, Star, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminRooms, useCreateRoom, useUpdateRoom, useDeleteRoom, Room } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';

const roomTypes = ['1BHK', '2BHK', '3BHK', 'studio', 'pg', 'hostel', 'flat', 'villa'] as const;

const amenitiesList = [
  'WiFi', 'AC', 'Parking', 'Gym', 'Swimming Pool', 'Power Backup',
  'Security', 'CCTV', 'Lift', 'Garden', 'Balcony', 'Kitchen',
  'Washing Machine', 'Refrigerator', 'TV', 'Furnished', 'Semi-Furnished',
  'Water Supply', 'Gas Connection', 'Maintenance Staff'
];

const AdminRooms = () => {
  const { toast } = useToast();
  const { data: rooms = [], isLoading } = useAdminRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_day: '',
    price_per_month: '',
    location: '',
    city: '',
    room_type: 'flat' as typeof roomTypes[number],
    bedrooms: '1',
    bathrooms: '1',
    area_sqft: '',
    amenities: [] as string[],
    images: [] as string[],
    rating: '4.0',
    is_available: true,
  });

  const openModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        title: room.title,
        description: room.description || '',
        price_per_day: room.price_per_day.toString(),
        price_per_month: room.price_per_month.toString(),
        location: room.location,
        city: room.city,
        room_type: room.room_type,
        bedrooms: (room.bedrooms || 1).toString(),
        bathrooms: (room.bathrooms || 1).toString(),
        area_sqft: (room.area_sqft || '').toString(),
        amenities: room.amenities || [],
        images: room.images || [],
        rating: (room.rating || 4.0).toString(),
        is_available: room.is_available ?? true,
      });
    } else {
      setEditingRoom(null);
      setFormData({
        title: '',
        description: '',
        price_per_day: '',
        price_per_month: '',
        location: '',
        city: '',
        room_type: 'flat',
        bedrooms: '1',
        bathrooms: '1',
        area_sqft: '',
        amenities: [],
        images: [],
        rating: '4.0',
        is_available: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `rooms/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('room-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('room-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast({ title: `${uploadedUrls.length} image(s) uploaded successfully` });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Failed to upload images', variant: 'destructive' });
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const roomData = {
      title: formData.title,
      description: formData.description,
      price_per_day: parseFloat(formData.price_per_day),
      price_per_month: parseFloat(formData.price_per_month),
      location: formData.location,
      city: formData.city,
      room_type: formData.room_type,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      area_sqft: formData.area_sqft ? parseInt(formData.area_sqft) : null,
      amenities: formData.amenities,
      images: formData.images,
      rating: parseFloat(formData.rating),
      is_available: formData.is_available,
    };

    try {
      if (editingRoom) {
        await updateRoom.mutateAsync({ id: editingRoom.id, ...roomData });
        toast({ title: 'Room updated successfully' });
      } else {
        await createRoom.mutateAsync(roomData);
        toast({ title: 'Room created successfully' });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Error saving room', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await deleteRoom.mutateAsync(id);
      toast({ title: 'Room deleted successfully' });
    } catch (error) {
      toast({ title: 'Error deleting room', variant: 'destructive' });
    }
  };

  const toggleAvailability = async (room: Room) => {
    try {
      await updateRoom.mutateAsync({ 
        id: room.id, 
        is_available: !room.is_available 
      });
      toast({ 
        title: `Room ${!room.is_available ? 'activated' : 'deactivated'}` 
      });
    } catch (error) {
      toast({ title: 'Error updating room', variant: 'destructive' });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Rooms</h1>
          <p className="text-muted-foreground">{rooms.length} rooms total</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border overflow-hidden group"
          >
            <div className="relative h-48">
              {room.images && room.images.length > 0 ? (
                <img
                  src={room.images[0]}
                  alt={room.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  room.is_available ? 'bg-success/90 text-success-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {room.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded-full">
                  {room.room_type.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground truncate">{room.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{room.location}, {room.city}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span className="font-medium text-foreground">{room.rating}</span>
                </div>
                <div>
                  <span className="font-bold text-primary">₹{room.price_per_month.toLocaleString()}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{room.bedrooms} Bed</span>
                <span>{room.bathrooms} Bath</span>
                {room.area_sqft && <span>{room.area_sqft} sqft</span>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={room.is_available ?? true}
                    onCheckedChange={() => toggleAvailability(room)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {room.is_available ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openModal(room)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(room.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No rooms yet</h3>
          <p className="text-muted-foreground mb-4">Get started by adding your first room</p>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Spacious 2BHK Apartment"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Describe the room features, nearby facilities, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Location *</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Koramangala, 5th Block"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Bangalore"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Room Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Type *</label>
                      <select
                        value={formData.room_type}
                        onChange={(e) => setFormData({ ...formData, room_type: e.target.value as typeof roomTypes[number] })}
                        className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        {roomTypes.map(type => (
                          <option key={type} value={type}>{type.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Bedrooms</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Bathrooms</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                        className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Area (sqft)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.area_sqft}
                        onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                        className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="1200"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Price/Day (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.price_per_day}
                        onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                        className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="1500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Price/Month (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.price_per_month}
                        onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value })}
                        className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="35000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Rating</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={formData.rating}
                          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                          className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <Star className="w-5 h-5 fill-warning text-warning flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <h3 className="font-semibold text-foreground">Availability</h3>
                    <p className="text-sm text-muted-foreground">Room will be visible to users</p>
                  </div>
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {amenitiesList.map((amenity) => (
                      <label
                        key={amenity}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          formData.amenities.includes(amenity)
                            ? 'border-primary bg-primary/5 text-foreground'
                            : 'border-border hover:border-primary/50 text-muted-foreground'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="sr-only"
                        />
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                          formData.amenities.includes(amenity)
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border'
                        }`}>
                          {formData.amenities.includes(amenity) && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Images</h3>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group aspect-video rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Room ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImages}
                      className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      {uploadingImages ? (
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6" />
                          <span className="text-xs">Upload</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    You can also add image URLs directly:
                  </p>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg (press Enter to add)"
                    className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const url = input.value.trim();
                        if (url && url.startsWith('http')) {
                          setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, url],
                          }));
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={createRoom.isPending || updateRoom.isPending}
                  >
                    {createRoom.isPending || updateRoom.isPending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : editingRoom ? 'Update Room' : 'Create Room'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminRooms;
