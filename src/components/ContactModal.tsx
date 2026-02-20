import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactModal = ({ open, onOpenChange }: ContactModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Παρακαλώ συμπληρώστε όλα τα πεδία');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Παρακαλώ εισάγετε ένα έγκυρο email');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          name: name.trim().slice(0, 100),
          email: email.trim().slice(0, 255),
          message: message.trim().slice(0, 2000),
        });

      if (dbError) throw dbError;

      try {
        await supabase.functions.invoke('send-contact-email', {
          body: {
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
          },
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }

      toast.success('Το μήνυμα στάλθηκε επιτυχώς! Θα επικοινωνήσουμε μαζί σας σύντομα.');
      setName('');
      setEmail('');
      setMessage('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Αποτυχία αποστολής μηνύματος. Δοκιμάστε ξανά.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Επικοινωνία</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Όνομα
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Το όνομά σας"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Μήνυμα
            </label>
            <Textarea
              id="message"
              placeholder="Πώς μπορούμε να σας βοηθήσουμε;"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              rows={4}
              disabled={isSubmitting}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/2000 χαρακτήρες
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Ακύρωση
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Αποστολή...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Αποστολή Μηνύματος
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;