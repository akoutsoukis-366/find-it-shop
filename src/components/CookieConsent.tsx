import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'metavex_cookie_consent';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card border border-border rounded-2xl shadow-lg p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
              <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5 md:mt-0" />
              <div className="flex-1 text-sm text-muted-foreground">
                <p>
                  Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας στο κατάστημά μας. 
                  Συνεχίζοντας, αποδέχεστε τη χρήση cookies σύμφωνα με την{' '}
                  <a href="/privacy" className="text-primary underline hover:text-primary/80">
                    Πολιτική Απορρήτου
                  </a> μας.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDecline}
                  className="flex-1 md:flex-none"
                >
                  Απόρριψη
                </Button>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="flex-1 md:flex-none bg-[hsl(220,100%,50%)] hover:bg-[hsl(220,100%,45%)] text-white"
                >
                  Αποδοχή
                </Button>
              </div>
              <button
                onClick={handleDecline}
                className="absolute top-3 right-3 md:hidden text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
