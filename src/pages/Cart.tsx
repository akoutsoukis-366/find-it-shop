import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Loader2, Truck, Gift, Calendar } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import itagPro from '@/assets/itag-pro.png';
import itagMini from '@/assets/itag-mini.png';
import itagUltra from '@/assets/itag-ultra.png';
import itagSlim from '@/assets/itag-slim.png';
import itagPet from '@/assets/itag-pet.png';
import itagPack from '@/assets/itag-pack.png';

// Fallback image mapping by product name
const getProductImage = (product: { name: string; image: string }): string => {
  // Use the image from the database if available
  if (product.image && product.image.startsWith('http')) {
    return product.image;
  }
  
  // Fallback to local assets based on product name
  const nameLower = product.name.toLowerCase();
  if (nameLower.includes('pro')) return itagPro;
  if (nameLower.includes('mini')) return itagMini;
  if (nameLower.includes('ultra')) return itagUltra;
  if (nameLower.includes('slim')) return itagSlim;
  if (nameLower.includes('pet')) return itagPet;
  if (nameLower.includes('pack') || nameLower.includes('bundle')) return itagPack;
  
  return itagPro; // Default fallback
};

interface ShippingSettings {
  shippingCost: number;
  freeShippingThreshold: number;
  currency: string;
  standardShippingDaysMin: number;
  standardShippingDaysMax: number;
  expressShippingCost: number;
  expressShippingDaysMin: number;
  expressShippingDaysMax: number;
}

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { formatPrice } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    shippingCost: 9.99,
    freeShippingThreshold: 50,
    currency: 'EUR',
    standardShippingDaysMin: 5,
    standardShippingDaysMax: 7,
    expressShippingCost: 14.99,
    expressShippingDaysMin: 1,
    expressShippingDaysMax: 3,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    fetchShippingSettings();
  }, []);

  const fetchShippingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'shipping_cost', 
          'free_shipping_threshold', 
          'currency',
          'standard_shipping_days_min',
          'standard_shipping_days_max',
          'express_shipping_cost',
          'express_shipping_days_min',
          'express_shipping_days_max',
        ]);

      if (error) throw error;

      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach((item) => {
          settingsMap[item.key] = item.value || '';
        });

        setShippingSettings({
          shippingCost: parseFloat(settingsMap.shipping_cost || '9.99'),
          freeShippingThreshold: parseFloat(settingsMap.free_shipping_threshold || '50'),
          currency: settingsMap.currency || 'EUR',
          standardShippingDaysMin: parseInt(settingsMap.standard_shipping_days_min || '5'),
          standardShippingDaysMax: parseInt(settingsMap.standard_shipping_days_max || '7'),
          expressShippingCost: parseFloat(settingsMap.express_shipping_cost || '14.99'),
          expressShippingDaysMin: parseInt(settingsMap.express_shipping_days_min || '1'),
          expressShippingDaysMax: parseInt(settingsMap.express_shipping_days_max || '3'),
        });
      }
    } catch (error) {
      console.error('Error fetching shipping settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const subtotal = getTotalPrice();
  const qualifiesForFreeShipping = shippingSettings.freeShippingThreshold > 0 && subtotal >= shippingSettings.freeShippingThreshold;
  const shipping = qualifiesForFreeShipping || shippingSettings.shippingCost === 0 ? 0 : shippingSettings.shippingCost;
  const total = subtotal + shipping;
  
  // Progress towards free shipping
  const amountToFreeShipping = shippingSettings.freeShippingThreshold > 0 
    ? Math.max(0, shippingSettings.freeShippingThreshold - subtotal)
    : 0;
  const freeShippingProgress = shippingSettings.freeShippingThreshold > 0
    ? Math.min(100, (subtotal / shippingSettings.freeShippingThreshold) * 100)
    : 100;

  // Estimated delivery dates
  const today = new Date();
  const standardDeliveryMin = addDays(today, shippingSettings.standardShippingDaysMin);
  const standardDeliveryMax = addDays(today, shippingSettings.standardShippingDaysMax);
  const expressDeliveryMin = addDays(today, shippingSettings.expressShippingDaysMin);
  const expressDeliveryMax = addDays(today, shippingSettings.expressShippingDaysMax);

  const formatDeliveryRange = (minDate: Date, maxDate: Date) => {
    if (format(minDate, 'MMM') === format(maxDate, 'MMM')) {
      return `${format(minDate, 'MMM d')} - ${format(maxDate, 'd')}`;
    }
    return `${format(minDate, 'MMM d')} - ${format(maxDate, 'MMM d')}`;
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // For logged-in users, check email verification
      if (user && !user.email_confirmed_at) {
        toast.error('Please verify your email before placing an order. Check your inbox for the verification link.');
        setIsLoading(false);
        return;
      }

      const cartItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
      }));

      // Get profile for prefilling if user is logged in
      let customerInfo = undefined;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          customerInfo = {
            email: profile.email || user.email,
            name: profile.full_name,
            phone: profile.phone,
            address: {
              line1: profile.address_line1,
              line2: profile.address_line2,
              city: profile.city,
              state: profile.state,
              postal_code: profile.postal_code,
              country: profile.country,
            },
          };
        }
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { items: cartItems, customerInfo },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link to="/products">
                <Button variant="hero" size="lg">
                  Start Shopping
                </Button>
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          {/* Free Shipping Progress Banner */}
          {shippingSettings.freeShippingThreshold > 0 && !settingsLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 p-4 rounded-xl border ${
                qualifiesForFreeShipping 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-primary/5 border-primary/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {qualifiesForFreeShipping ? (
                  <>
                    <Gift className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-500">
                      🎉 You've unlocked FREE shipping!
                    </span>
                  </>
                ) : (
                  <>
                    <Truck className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">
                      Add {formatPrice(amountToFreeShipping)} more for FREE shipping
                    </span>
                  </>
                )}
              </div>
              <Progress 
                value={freeShippingProgress} 
                className={`h-2 ${qualifiesForFreeShipping ? '[&>div]:bg-green-500' : ''}`}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Free shipping on orders over {formatPrice(shippingSettings.freeShippingThreshold)}
              </p>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                  Shopping Cart ({items.length})
                </h1>
                <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
                  Clear Cart
                </Button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.selectedColor}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-6 p-6 bg-card rounded-2xl border border-border"
                    >
                      {/* Image */}
                      <div className="w-24 h-24 bg-secondary rounded-xl overflow-hidden flex items-center justify-center">
                        <img
                          src={getProductImage(item.product)}
                          alt={item.product.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-foreground">{item.product.name}</h3>
                          </div>
                          <span className="font-semibold text-foreground">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.product.id, item.selectedColor, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-foreground w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.product.id, item.selectedColor, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.product.id, item.selectedColor)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 bg-card rounded-2xl border border-border space-y-6">
                <h2 className="text-xl font-bold text-foreground">Order Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      Shipping
                      {qualifiesForFreeShipping && (
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className={qualifiesForFreeShipping ? 'line-through text-muted-foreground/50' : ''}>
                      {shipping === 0 && !qualifiesForFreeShipping ? 'Free' : formatPrice(shippingSettings.shippingCost)}
                    </span>
                  </div>
                  {!qualifiesForFreeShipping && shippingSettings.freeShippingThreshold > 0 && amountToFreeShipping > 0 && (
                    <p className="text-sm text-primary flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      Add {formatPrice(amountToFreeShipping)} more for free shipping!
                    </p>
                  )}
                  
                  {/* Estimated Delivery Dates */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Calendar className="h-4 w-4" />
                      Estimated Delivery
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-foreground">Standard Shipping</span>
                      <span className="text-muted-foreground font-medium">
                        {formatDeliveryRange(standardDeliveryMin, standardDeliveryMax)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-lg font-semibold text-foreground">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </Button>

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
