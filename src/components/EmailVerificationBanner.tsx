import { useState, useEffect } from 'react';
import { Mail, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmailVerificationBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && !user.email_confirmed_at) {
        setShowBanner(true);
        setUserEmail(user.email || null);
      } else {
        setShowBanner(false);
      }
    };

    checkVerificationStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && !session.user.email_confirmed_at) {
        setShowBanner(true);
        setUserEmail(session.user.email || null);
      } else {
        setShowBanner(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResendVerification = async () => {
    if (!userEmail) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
      
      toast.success('Verification email sent! Please check your inbox.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send verification email';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Mail className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-foreground">
              Please verify your email address to access all features.
              {userEmail && (
                <span className="text-muted-foreground ml-1">
                  We sent a verification link to <strong>{userEmail}</strong>
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              disabled={isResending}
              className="border-amber-500/30 hover:bg-amber-500/10"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Email'
              )}
            </Button>
            
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
