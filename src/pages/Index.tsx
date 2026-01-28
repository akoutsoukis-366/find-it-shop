import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Shield, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useContentSettings } from '@/hooks/useContentSettings';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
const Index = () => {
  const { products, isLoading: productsLoading } = useProducts();
  const { content, isLoading: contentLoading } = useContentSettings();
  const featuredProducts = products.filter((p) => p.featured);

  // Hero video comes entirely from database
  const heroVideoUrl = content.hero_video_url || '';

  const features = [
    {
      icon: MapPin,
      title: content.feature1_title,
      description: content.feature1_description,
    },
    {
      icon: Zap,
      title: content.feature2_title,
      description: content.feature2_description,
    },
    {
      icon: Shield,
      title: content.feature3_title,
      description: content.feature3_description,
    },
  ];

  const isLoading = productsLoading || contentLoading;

  // Show full-page loading while content loads to prevent flash of empty content
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden pt-16">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pt-12 pb-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto"
          >
            {content.hero_badge_text && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-muted-foreground">{content.hero_badge_text}</span>
              </div>
            )}

            {(content.hero_title_line1 || content.hero_title_line2) && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
                {content.hero_title_line1 && <span className="block sm:inline">{content.hero_title_line1}</span>}
                {content.hero_title_line1 && content.hero_title_line2 && ' '}
                {content.hero_title_line2 && <span className="gradient-text block sm:inline">{content.hero_title_line2}</span>}
              </h1>
            )}

            {content.hero_description && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                {content.hero_description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link to="/products">
                <Button variant="hero" size="xl">
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="glass" size="xl">
                  Learn More
                </Button>
              </Link>
            </div>

            {(content.hero_stat1_value || content.hero_stat2_value || content.hero_stat3_value) && (
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4">
                {(content.hero_stat1_value || content.hero_stat1_label) && (
                  <div className="text-center">
                    {content.hero_stat1_value && <div className="text-2xl sm:text-3xl font-bold text-foreground">{content.hero_stat1_value}</div>}
                    {content.hero_stat1_label && <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">{content.hero_stat1_label}</div>}
                  </div>
                )}
                {(content.hero_stat1_value || content.hero_stat1_label) && (content.hero_stat2_value || content.hero_stat2_label) && (
                  <div className="hidden sm:block w-px h-12 bg-border" />
                )}
                {(content.hero_stat2_value || content.hero_stat2_label) && (
                  <div className="text-center">
                    {content.hero_stat2_value && <div className="text-2xl sm:text-3xl font-bold text-foreground">{content.hero_stat2_value}</div>}
                    {content.hero_stat2_label && <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">{content.hero_stat2_label}</div>}
                  </div>
                )}
                {(content.hero_stat2_value || content.hero_stat2_label) && (content.hero_stat3_value || content.hero_stat3_label) && (
                  <div className="hidden sm:block w-px h-12 bg-border" />
                )}
                {(content.hero_stat3_value || content.hero_stat3_label) && (
                  <div className="text-center">
                    {content.hero_stat3_value && <div className="text-2xl sm:text-3xl font-bold text-foreground">{content.hero_stat3_value}</div>}
                    {content.hero_stat3_label && <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">{content.hero_stat3_label}</div>}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Hero Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex-1 w-full flex items-center justify-center px-4 pb-8"
        >
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-[100px]" />
          </div>
          
          {/* Video container with gradients */}
          <div className="relative max-w-4xl w-full mx-auto">
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 pointer-events-none z-10 rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 pointer-events-none z-10 rounded-2xl" />
            
            {/* Video */}
            {heroVideoUrl ? (
              <video
                src={heroVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-contain rounded-2xl"
                style={{
                  maxHeight: '500px',
                }}
              />
            ) : (
              <div className="w-full h-[400px] bg-muted/50 rounded-2xl flex items-center justify-center">
                <p className="text-muted-foreground">No hero video configured</p>
              </div>
            )}
            
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-10 rounded-b-2xl" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      {(content.features_title || content.features_subtitle || features.some(f => f.title || f.description)) && (
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            {(content.features_title || content.features_subtitle) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                {content.features_title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {content.features_title}
                  </h2>
                )}
                {content.features_subtitle && (
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {content.features_subtitle}
                  </p>
                )}
              </motion.div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              {features.filter(f => f.title || f.description).map((feature, index) => (
                <motion.div
                  key={feature.title || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:shadow-button transition-shadow">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  {feature.title && <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>}
                  {feature.description && <p className="text-muted-foreground">{feature.description}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-card/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-12"
            >
              <div>
                {content.featured_products_title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {content.featured_products_title}
                  </h2>
                )}
                {content.featured_products_subtitle && (
                  <p className="text-muted-foreground">
                    {content.featured_products_subtitle}
                  </p>
                )}
              </div>
              <Link to="/products">
                <Button variant="outline">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {(content.cta_title_line1 || content.cta_title_line2 || content.cta_description || content.cta_button_text) && (
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              {(content.cta_title_line1 || content.cta_title_line2) && (
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  {content.cta_title_line1}
                  {content.cta_title_line1 && content.cta_title_line2 && <br />}
                  {content.cta_title_line2 && <span className="gradient-text">{content.cta_title_line2}</span>}
                </h2>
              )}
              {content.cta_description && (
                <p className="text-xl text-muted-foreground mb-8">
                  {content.cta_description}
                </p>
              )}
              {content.cta_button_text && (
                <Link to="/products">
                  <Button variant="hero" size="xl">
                    {content.cta_button_text}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
