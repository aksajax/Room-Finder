import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Tag, Percent, IndianRupee, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_booking_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminCoupons = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_booking_amount: '0',
    max_discount: '',
    usage_limit: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    is_active: true,
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const createCoupon = useMutation({
    mutationFn: async (coupon: Omit<Coupon, 'id' | 'created_at' | 'used_count'>) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert(coupon)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const updateCoupon = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Coupon> & { id: string }) => {
      const { data, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value.toString(),
        min_booking_amount: coupon.min_booking_amount.toString(),
        max_discount: coupon.max_discount?.toString() || '',
        usage_limit: coupon.usage_limit?.toString() || '',
        valid_from: coupon.valid_from.split('T')[0],
        valid_until: coupon.valid_until?.split('T')[0] || '',
        is_active: coupon.is_active,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_booking_amount: '0',
        max_discount: '',
        usage_limit: '',
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData = {
      code: formData.code.toUpperCase().trim(),
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_booking_amount: parseFloat(formData.min_booking_amount) || 0,
      max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      valid_from: formData.valid_from,
      valid_until: formData.valid_until || null,
      is_active: formData.is_active,
    };

    try {
      if (editingCoupon) {
        await updateCoupon.mutateAsync({ id: editingCoupon.id, ...couponData });
        toast({ title: 'Coupon updated successfully' });
      } else {
        await createCoupon.mutateAsync(couponData);
        toast({ title: 'Coupon created successfully' });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ 
        title: 'Error saving coupon', 
        description: error.message?.includes('duplicate') ? 'Coupon code already exists' : error.message,
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      await deleteCoupon.mutateAsync(id);
      toast({ title: 'Coupon deleted successfully' });
    } catch (error) {
      toast({ title: 'Error deleting coupon', variant: 'destructive' });
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await updateCoupon.mutateAsync({ 
        id: coupon.id, 
        is_active: !coupon.is_active 
      });
      toast({ title: `Coupon ${!coupon.is_active ? 'activated' : 'deactivated'}` });
    } catch (error) {
      toast({ title: 'Error updating coupon', variant: 'destructive' });
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
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
          <h1 className="text-2xl font-bold text-foreground">Manage Coupons</h1>
          <p className="text-muted-foreground">{coupons.length} coupons total</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Coupon
        </Button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-card rounded-xl border p-4 space-y-3 ${
              coupon.is_active ? 'border-border' : 'border-border/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  coupon.discount_type === 'percentage' ? 'bg-primary/10' : 'bg-success/10'
                }`}>
                  {coupon.discount_type === 'percentage' ? (
                    <Percent className="w-5 h-5 text-primary" />
                  ) : (
                    <IndianRupee className="w-5 h-5 text-success" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-foreground font-mono">{coupon.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}% off` 
                      : `₹${coupon.discount_value} off`}
                  </p>
                </div>
              </div>
              <Switch
                checked={coupon.is_active}
                onCheckedChange={() => toggleActive(coupon)}
              />
            </div>

            {coupon.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{coupon.description}</p>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-secondary rounded-lg p-2">
                <p className="text-muted-foreground">Min Amount</p>
                <p className="font-medium text-foreground">₹{coupon.min_booking_amount}</p>
              </div>
              {coupon.max_discount && (
                <div className="bg-secondary rounded-lg p-2">
                  <p className="text-muted-foreground">Max Discount</p>
                  <p className="font-medium text-foreground">₹{coupon.max_discount}</p>
                </div>
              )}
              {coupon.usage_limit && (
                <div className="bg-secondary rounded-lg p-2">
                  <p className="text-muted-foreground">Usage</p>
                  <p className="font-medium text-foreground">{coupon.used_count}/{coupon.usage_limit}</p>
                </div>
              )}
              {coupon.valid_until && (
                <div className="bg-secondary rounded-lg p-2">
                  <p className="text-muted-foreground">Expires</p>
                  <p className="font-medium text-foreground">
                    {new Date(coupon.valid_until).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
              <Button variant="ghost" size="icon" onClick={() => openModal(coupon)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No coupons yet</h3>
          <p className="text-muted-foreground mb-4">Create discount coupons for your customers</p>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Coupon
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
              className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">
                  {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Coupon Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="flex-1 h-10 px-3 bg-secondary border border-border rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="SUMMER20"
                      required
                    />
                    <Button type="button" variant="outline" onClick={generateCode}>
                      Generate
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Summer sale discount"
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Discount Type *</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Discount Value *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={formData.discount_type === 'percentage' ? 100 : undefined}
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                        className="w-full h-10 px-3 pr-8 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder={formData.discount_type === 'percentage' ? '20' : '500'}
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {formData.discount_type === 'percentage' ? '%' : '₹'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Min Amount & Max Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Min Booking Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.min_booking_amount}
                      onChange={(e) => setFormData({ ...formData, min_booking_amount: e.target.value })}
                      className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Max Discount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_discount}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                      className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="500"
                    />
                  </div>
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                {/* Validity Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Valid From *</label>
                    <input
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Valid Until</label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Active</p>
                    <p className="text-sm text-muted-foreground">Coupon can be used by customers</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={createCoupon.isPending || updateCoupon.isPending}
                  >
                    {createCoupon.isPending || updateCoupon.isPending ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
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

export default AdminCoupons;
