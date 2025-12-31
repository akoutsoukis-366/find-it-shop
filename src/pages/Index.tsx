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
import heroImage from '@/assets/itag-hero.png';

const Index = () => {
  const { products, isLoading: productsLoading } = useProducts();
  const { content, isLoading: contentLoading } = useContentSettings();
  const featuredProducts = products.filter((p) => p.featured);

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

  return (
    <div className="min-h-screen bg-background">
      <EmailVerificationBanner />
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-muted-foreground">{content.hero_badge_text}</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
                {content.hero_title_line1}
                <br />
                <span className="gradient-text">{content.hero_title_line2}</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-md">
                {content.hero_description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
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

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-foreground">{content.hero_stat1_value}</div>
                  <div className="text-sm text-muted-foreground">{content.hero_stat1_label}</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <div className="text-3xl font-bold text-foreground">{content.hero_stat2_value}</div>
                  <div className="text-sm text-muted-foreground">{content.hero_stat2_label}</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <div className="text-3xl font-bold text-foreground">{content.hero_stat3_value}</div>
                  <div className="text-sm text-muted-foreground">{content.hero_stat3_label}</div>
                </div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              {/* Outer glow ring */}
              <div className="absolute w-[500px] h-[500px] bg-gradient-radial from-primary/30 via-primary/5 to-transparent rounded-full blur-[80px]" />
              
              {/* Inner accent glow */}
              <div className="absolute w-[300px] h-[300px] bg-accent/20 rounded-full blur-[60px] animate-pulse" />
              
              {/* Image container with mask for seamless blend */}
              <div className="relative w-full max-w-lg">
                <motion.img
                  src={heroImage}
                  alt="iTag Pro"
                  className="relative w-full animate-float mix-blend-screen"
                  style={{ 
                    filter: 'drop-shadow(0 0 40px hsl(var(--primary) / 0.4))',
                    maskImage: 'radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)',
                  }}
                />
              </div>
              
              {/* Subtle reflection */}
              <div className="absolute -bottom-20 w-[300px] h-[100px] bg-primary/10 rounded-full blur-[40px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {content.features_title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {content.features_subtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:shadow-button transition-shadow">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {content.featured_products_title}
              </h2>
              <p className="text-muted-foreground">
                {content.featured_products_subtitle}
              </p>
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

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {content.cta_title_line1}
              <br />
              <span className="gradient-text">{content.cta_title_line2}</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {content.cta_description}
            </p>
            <Link to="/products">
              <Button variant="hero" size="xl">
                {content.cta_button_text}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
