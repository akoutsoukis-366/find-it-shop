import { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactModal from './ContactModal';
import { useContentSettings } from '@/hooks/useContentSettings';

const Footer = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const { content } = useContentSettings();

  return (
    <>
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {content.logo_url && (
                  <img src={content.logo_url} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
                )}
                {content.store_name && <span className="text-xl font-bold text-foreground">{content.store_name}</span>}
              </div>
              {content.footer_description && (
                <p className="text-sm text-muted-foreground">
                  {content.footer_description}
                </p>
              )}
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Shop</h4>
              <ul className="space-y-2">
                <li><Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">All Products</Link></li>
                <li><Link to="/products?category=premium" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Premium</Link></li>
                <li><Link to="/products?category=bundle" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Bundles</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
                <li>
                  <button 
                    onClick={() => setContactOpen(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </button>
                </li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shipping</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()}{content.store_name ? ` ${content.store_name}.` : ''} All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
};

export default Footer;