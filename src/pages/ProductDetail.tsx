import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Loader2 } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGallery from '@/components/ProductGallery';
import { toast } from 'sonner';

const getProductImage = (imagePath: string | undefined): string => {
  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }
  return '/placeholder.svg';
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { product, isLoading, error } = useProduct(id);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const { formatPrice } = useCurrency();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Το προϊόν δεν βρέθηκε</h1>
          <Link to="/products">
            <Button>Πίσω στα Προϊόντα</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, product.colors[0] || '#1a1a1a');
    }
    toast.success(`${quantity} x ${product.name} προστέθηκε στο καλάθι!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Πίσω στα Προϊόντα
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ProductGallery
                images={product.mediaUrls || []}
                productName={product.name}
                mainImage={getProductImage(product.image)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {product.originalPrice && (
                <div className="inline-block px-3 py-1 rounded-full gradient-primary text-sm font-semibold text-primary-foreground">
                  Κερδίζετε {formatPrice(product.originalPrice - product.price)}
                </div>
              )}

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-foreground">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Ποσότητα
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-medium text-foreground w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock 
                  ? `Προσθήκη στο Καλάθι - ${formatPrice(product.price * quantity)}`
                  : 'Εξαντλήθηκε'
                }
              </Button>

              <Accordion type="multiple" className="w-full border-t border-border">
                {product.description && (
                  <AccordionItem value="description" className="border-b border-border">
                    <AccordionTrigger className="py-5 text-base font-medium text-foreground hover:no-underline">
                      Περιγραφή
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.description}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {product.specs && product.specs.length > 0 && (
                  <AccordionItem value="specs" className="border-b border-border">
                    <AccordionTrigger className="py-5 text-base font-medium text-foreground hover:no-underline">
                      Τεχνικές Προδιαγραφές
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <div className="space-y-2">
                        {product.specs.map((spec, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                            <span className="text-muted-foreground">{spec.label}</span>
                            <span className="font-medium text-foreground">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {product.shippingReturnsInfo && (
                  <AccordionItem value="shipping" className="border-b border-border">
                    <AccordionTrigger className="py-5 text-base font-medium text-foreground hover:no-underline">
                      Αποστολές & Επιστροφές
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.shippingReturnsInfo}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {product.warrantyInfo && (
                  <AccordionItem value="warranty" className="border-b border-border">
                    <AccordionTrigger className="py-5 text-base font-medium text-foreground hover:no-underline">
                      Εγγύηση Καλής Λειτουργίας
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.warrantyInfo}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;