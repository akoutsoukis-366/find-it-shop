import { Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useContentSettings } from '@/hooks/useContentSettings';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesStrip from '@/components/landing/FeaturesStrip';
import FeaturedProducts from '@/components/landing/FeaturedProducts';
import CtaSection from '@/components/landing/CtaSection';
import CategorySection from '@/components/CategorySection';
import TrustSignals from '@/components/TrustSignals';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

const Index = () => {
  const { products, isLoading: productsLoading } = useProducts();
  const { content, isLoading: contentLoading } = useContentSettings();
  const featuredProducts = products.filter((p) => p.featured);
  const isLoading = productsLoading || contentLoading;

  return (
    <div className="min-h-screen bg-background">
      <EmailVerificationBanner />
      <Navbar />
      <main>
        {contentLoading ? (
          <div className="h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <HeroSection content={content} />
            <TrustSignals />
            <CategorySection />
            <FeaturedProducts
              content={content}
              products={featuredProducts}
              isLoading={isLoading}
            />
            <FeaturesStrip content={content} />
            <CtaSection content={content} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
