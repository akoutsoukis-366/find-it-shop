import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Heart, Mail, Phone, MapPinned, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactModal from '@/components/ContactModal';
import { usePublicSettings } from '@/hooks/usePublicSettings';
import { useContentSettings } from '@/hooks/useContentSettings';

const About = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const { settings, isLoading: settingsLoading } = usePublicSettings();
  const { content, isLoading: contentLoading } = useContentSettings();

  const isLoading = settingsLoading || contentLoading;

  const values = [
    {
      id: 'value1',
      icon: Shield,
      title: content.about_value1_title,
      description: content.about_value1_description,
    },
    {
      id: 'value2',
      icon: Zap,
      title: content.about_value2_title,
      description: content.about_value2_description,
    },
    {
      id: 'value3',
      icon: Heart,
      title: content.about_value3_title,
      description: content.about_value3_description,
    },
  ].filter(value => value.title || value.description);

  const stats = [
    { id: 'stat1', value: content.about_stat1_value, label: content.about_stat1_label },
    { id: 'stat2', value: content.about_stat2_value, label: content.about_stat2_label },
    { id: 'stat3', value: content.about_stat3_value, label: content.about_stat3_label },
    { id: 'stat4', value: content.about_stat4_value, label: content.about_stat4_label },
  ].filter(stat => stat.value || stat.label);

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
                {content.about_hero_title_line1}
                <br />
                <span className="gradient-text">{content.about_hero_title_line2}</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {content.about_hero_description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        {stats.length > 0 && (
          <section className="py-16 bg-card/50">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.id}
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
        )}

        {/* Story */}
        {(content.about_story_title || content.about_story_paragraph1 || content.about_story_paragraph2 || content.about_story_paragraph3) && (
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  {content.about_story_title && (
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                      {content.about_story_title}
                    </h2>
                  )}
                  {content.about_story_paragraph1 && (
                    <p className="text-muted-foreground">
                      {content.about_story_paragraph1}
                    </p>
                  )}
                  {content.about_story_paragraph2 && (
                    <p className="text-muted-foreground">
                      {content.about_story_paragraph2}
                    </p>
                  )}
                  {content.about_story_paragraph3 && (
                    <p className="text-muted-foreground">
                      {content.about_story_paragraph3}
                    </p>
                  )}
                </motion.div>

                {(content.about_story_box_title || content.about_story_box_subtitle) && (
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
                        {content.about_story_box_title && (
                          <h3 className="text-2xl font-bold text-foreground mb-2">
                            {content.about_story_box_title}
                          </h3>
                        )}
                        {content.about_story_box_subtitle && (
                          <p className="text-muted-foreground">
                            {content.about_story_box_subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Values */}
        {values.length > 0 && (
          <section className="py-24 bg-card/50">
            <div className="container mx-auto px-4">
              {(content.about_values_title || content.about_values_subtitle) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {content.about_values_title}
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {content.about_values_subtitle}
                  </p>
                </motion.div>
              )}

              <div className="grid md:grid-cols-3 gap-8">
                {values.map((value, index) => (
                  <motion.div
                    key={value.id}
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
        )}

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
                {content.about_contact_title}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {content.about_contact_subtitle}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {settings.contact_email && (
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
                  <a 
                    href={`mailto:${settings.contact_email}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {settings.contact_email}
                  </a>
                </motion.div>
              )}

              {settings.support_phone && (
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
                  <a 
                    href={`tel:${settings.support_phone.replace(/[^\d+]/g, '')}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {settings.support_phone}
                  </a>
                </motion.div>
              )}

              {settings.office_address && (
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
                  <p className="text-muted-foreground">
                    {settings.office_address}
                  </p>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center mt-12"
            >
              {(content.about_contact_title || content.about_contact_subtitle) && (
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => setContactOpen(true)}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  {content.cta_button_text || 'Contact Us'}
                </Button>
              )}
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
