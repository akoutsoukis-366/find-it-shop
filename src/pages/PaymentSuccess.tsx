import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const clearCart = useCartStore((state) => state.clearCart);
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    const verifyAndSaveOrder = async () => {
      if (sessionId) {
        try {
          console.log('[PaymentSuccess] Verifying session:', sessionId);
          
          // Get current user if logged in
          const { data: { session: authSession } } = await supabase.auth.getSession();
          
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { sessionId, userId: authSession?.user?.id },
          });
          
          if (error) {
            console.error('[PaymentSuccess] Error verifying payment:', error);
          } else if (data?.orderId) {
            console.log('[PaymentSuccess] Order created:', data.orderId);
            setOrderId(data.orderId);
          }
        } catch (err) {
          console.error('[PaymentSuccess] Error calling verify-payment:', err);
        }
      } else {
        console.log('[PaymentSuccess] No session_id in URL');
      }
      setVerifying(false);
    };

    verifyAndSaveOrder();
    clearCart();
  }, [clearCart, searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {verifying ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
              <h1 className="text-2xl font-bold text-foreground">Processing your order...</h1>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500/10 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-green-500" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-foreground mb-4"
              >
                Payment Successful!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Thank you for your order. You'll receive a confirmation email shortly.
                {orderId && (
                  <span className="block mt-2 text-sm">
                    Order ID: <span className="font-mono">{orderId.slice(0, 8)}...</span>
                  </span>
                )}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-2xl border border-border p-8 mb-8"
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Package className="w-8 h-8 text-primary" />
                  <span className="text-lg font-medium text-foreground">Order Confirmed</span>
                </div>
                <p className="text-muted-foreground">
                  Your order is being processed and will be shipped soon.
                  You'll receive tracking information via email once your order ships.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button asChild size="lg">
                  <Link to="/products">
                    Continue Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">
                    Back to Home
                  </Link>
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
