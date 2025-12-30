import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Clear the cart after successful payment
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
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
              Your order is being processed and will be shipped within 1-2 business days.
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
