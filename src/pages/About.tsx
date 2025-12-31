import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, MapPin, Heart, Mail, Phone, MapPinned, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactModal from '@/components/ContactModal';
import { usePublicSettings } from '@/hooks/usePublicSettings';

const About = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const { settings, isLoading } = usePublicSettings();

  const values = [
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your location data is end-to-end encrypted. Only you have access.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Cutting-edge technology that pushes the boundaries of what\'s possible.',
    },
    {
      icon: Heart,
      title: 'Customer Focus',
      description: 'Every product decision starts with our customers\' needs.',
    },
  ];

  const stats = [
    { value: '500K+', label: 'Happy Customers' },
    { value: '1M+', label: 'Items Found' },
    { value: '99.9%', label: 'Success Rate' },
    { value: '4.9', label: 'App Rating' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Our Mission is to
                <br />
                <span className="gradient-text">Bring Peace of Mind</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                We believe no one should have to worry about losing their valuables. 
                That's why we created iTag – the most reliable way to keep track of what matters most.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Our Story
                </h2>
                <p className="text-muted-foreground">
                  iTag was born from a simple frustration – we've all been there, 
                  frantically searching for keys when running late or worrying about 
                  lost luggage while traveling.
                </p>
                <p className="text-muted-foreground">
                  Founded in 2020, our team of engineers and designers set out to 
                  create the most reliable, user-friendly tracking device on the market. 
                  Today, iTag helps hundreds of thousands of people keep track of their 
                  most important items.
                </p>
                <p className="text-muted-foreground">
                  We're constantly innovating, pushing the boundaries of what's possible 
                  with location technology while maintaining our commitment to privacy 
                  and security.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square bg-card rounded-3xl border border-border flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                  <div className="relative text-center p-12">
                    <div className="w-24 h-24 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Never Lose Track
                    </h3>
                    <p className="text-muted-foreground">
                      Of what matters most to you
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-card/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Values
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 rounded-2xl bg-card border border-border text-center"
                >
                  <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get in Touch
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Have questions? We'd love to hear from you.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Email</h3>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                ) : (
                  <a 
                    href={`mailto:${settings.contact_email}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {settings.contact_email}
                  </a>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-card border border-border text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                ) : (
                  <a 
                    href={`tel:${settings.support_phone.replace(/[^\d+]/g, '')}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {settings.support_phone}
                  </a>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-card border border-border text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <MapPinned className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Office</h3>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                ) : (
                  <p className="text-muted-foreground">
                    {settings.office_address}
                  </p>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center mt-12"
            >
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => setContactOpen(true)}
              >
                <Mail className="w-5 h-5 mr-2" />
                Send us a Message
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default About;