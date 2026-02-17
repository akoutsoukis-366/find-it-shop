import { Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useContentSettings } from '@/hooks/useContentSettings';
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

  if (contentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EmailVerificationBanner />
      <Navbar />

      {/* Compact tagline banner */}
      {(content.hero_description || content.hero_title_line1) && (
        <div className="pt-20 pb-6 text-center bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4">
            {content.hero_title_line1 && (
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {content.hero_title_line1}
              </h1>
            )}
            {content.hero_description && (
              <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                {content.hero_description}
              </p>
            )}
          </div>
        </div>
      )}
      {!content.hero_description && !content.hero_title_line1 && <div className="pt-20" />}

      <CategorySection />
      <TrustSignals />
      <FeaturedProducts
        content={content}
        products={featuredProducts}
        isLoading={isLoading}
      />
      <FeaturesStrip content={content} />
      <CtaSection content={content} />
      <Footer />
    </div>
  );
};

export default Index;
