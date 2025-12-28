import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, User, Phone, Mail, Calendar, CreditCard, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBooking } from '@/hooks/useBookings';
import { Room } from '@/hooks/useRooms';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface BookingFormProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_booking_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BookingForm = ({ room, isOpen, onClose }: BookingFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    checkIn: '',
    checkOut: '',
    paymentMethod: 'online',
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const baseAmount = room.price_per_month * 0.1; // 10% deposit

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    let discount = 0;
    if (appliedCoupon.discount_type === 'percentage') {
      discount = (baseAmount * appliedCoupon.discount_value) / 100;
    } else {
      discount = appliedCoupon.discount_value;
    }
    
    // Apply max discount cap if set
    if (appliedCoupon.max_discount && discount > appliedCoupon.max_discount) {
      discount = appliedCoupon.max_discount;
    }
    
    // Ensure discount doesn't exceed base amount
    return Math.min(discount, baseAmount);
  };

  const discountAmount = calculateDiscount();
  const finalAmount = baseAmount - discountAmount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setCouponError('');
    setAppliedCoupon(null);

    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        setCouponError('Invalid coupon code');
        return;
      }

      // Check validity period
      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        setCouponError('Coupon is not yet valid');
        return;
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        setCouponError('Coupon has expired');
        return;
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        setCouponError('Coupon usage limit reached');
        return;
      }

      // Check minimum amount
      if (coupon.min_booking_amount && baseAmount < coupon.min_booking_amount) {
        setCouponError(`Minimum booking amount is ₹${coupon.min_booking_amount}`);
        return;
      }

      setAppliedCoupon(coupon as Coupon);
      toast({ title: 'Coupon applied successfully!' });
    } catch (error) {
      console.error('Coupon error:', error);
      setCouponError('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleRazorpayPayment = async (bookingData: { id: string; total_amount: number }) => {
    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: bookingData.total_amount,
          bookingId: bookingData.id,
          roomTitle: room.title,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
        },
      });

      if (orderError || orderData?.error) {
        throw new Error(orderData?.error || orderError?.message || 'Failed to create order');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RoomFinder',
        description: `Booking for ${room.title}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: bookingData.id,
            },
          });

          if (verifyError || !verifyData?.success) {
            toast({
              title: 'Payment verification failed',
              description: verifyData?.error || 'Please contact support.',
              variant: 'destructive',
            });
            return;
          }

          // Update coupon usage count if applied
          if (appliedCoupon) {
            await supabase
              .from('coupons')
              .update({ used_count: appliedCoupon.used_count + 1 })
              .eq('id', appliedCoupon.id);
          }

          setBookingId(bookingData.id.slice(-8).toUpperCase());
          setShowSuccess(true);
          setIsProcessing(false);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast({
              title: 'Payment cancelled',
              description: 'Your booking is pending. Complete payment to confirm.',
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      setIsProcessing(false);
      toast({
        title: 'Payment failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Please login to book',
        description: 'You need to be logged in to make a booking.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!formData.name || !formData.phone || !formData.email || !formData.checkIn) {
      toast({
        title: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = await createBooking.mutateAsync({
        room_id: room.id,
        full_name: formData.name,
        phone: formData.phone,
        email: formData.email,
        check_in_date: formData.checkIn,
        check_out_date: formData.checkOut || null,
        payment_method: formData.paymentMethod,
        total_amount: finalAmount,
        coupon_id: appliedCoupon?.id || null,
        discount_amount: discountAmount,
      });

      if (formData.paymentMethod === 'online') {
        await handleRazorpayPayment({ id: result.id, total_amount: finalAmount });
      } else {
        // Update coupon usage for cash bookings too
        if (appliedCoupon) {
          await supabase
            .from('coupons')
            .update({ used_count: appliedCoupon.used_count + 1 })
            .eq('id', appliedCoupon.id);
        }
        setBookingId(result.id.slice(-8).toUpperCase());
        setShowSuccess(true);
        setIsProcessing(false);
      }
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: 'Booking failed',
        description: 'There was an error processing your booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setFormData({
      name: '',
      phone: '',
      email: '',
      checkIn: '',
      checkOut: '',
      paymentMethod: 'online',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {showSuccess ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-success" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Booking Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your booking for <span className="font-medium text-foreground">{room.title}</span> has been confirmed.
              </p>
              <div className="bg-secondary rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-medium text-foreground">RF{bookingId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Room</span>
                  <span className="font-medium text-foreground">{room.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium text-foreground">₹{finalAmount.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <Button onClick={handleClose} className="w-full" size="lg">
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Book This Room</h2>
                  <p className="text-sm text-muted-foreground">{room.title}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {!user && (
                <div className="mx-6 mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-warning">
                    You need to be logged in to make a booking.{' '}
                    <button onClick={() => navigate('/login')} className="underline font-medium">
                      Login here
                    </button>
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Check-in Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Check-out Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Coupon Code */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Coupon Code</label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-success" />
                        <span className="font-medium text-success">{appliedCoupon.code}</span>
                        <span className="text-sm text-success">
                          ({appliedCoupon.discount_type === 'percentage' 
                            ? `${appliedCoupon.discount_value}% off` 
                            : `₹${appliedCoupon.discount_value} off`})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-sm text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          placeholder="Enter coupon code"
                          className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all uppercase"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </Button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-sm text-destructive mt-1">{couponError}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'online', label: 'Razorpay', icon: CreditCard },
                      { value: 'cash', label: 'Cash on Visit', icon: Wallet },
                    ].map(option => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.paymentMethod === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.value}
                          checked={formData.paymentMethod === option.value}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="sr-only"
                        />
                        <option.icon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-secondary rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Rent</span>
                    <span className="font-medium text-foreground">₹{room.price_per_month.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Booking Deposit (10%)</span>
                    <span className="font-medium text-foreground">₹{baseAmount.toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-medium text-foreground">Total Payable</span>
                    <span className="font-bold text-primary">₹{finalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  variant="hero"
                  disabled={isProcessing || !user}
                >
                  {isProcessing ? (
                    <>
                      <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : formData.paymentMethod === 'online' ? (
                    `Pay ₹${finalAmount.toLocaleString()} with Razorpay`
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingForm;

const Wallet = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
