import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, MapPin, Loader2, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { countries, getCountryByCode } from '@/data/countries';

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('GR');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');
  
  // Real-time validation
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  
  // Forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const [justSignedUp, setJustSignedUp] = useState(false);
  
  // Debounce timers
  const emailDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const phoneDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !justSignedUp) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Don't redirect if user just signed up - they need to verify email
      if (session && !justSignedUp) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, justSignedUp]);

  // Real-time email validation using RPC function
  const checkEmailExists = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailError(null);
      return;
    }
    
    setIsCheckingEmail(true);
    try {
      const { data: exists, error } = await supabase
        .rpc('check_email_exists', { check_email: email.toLowerCase().trim() });

      if (error) {
        console.error('Email check error:', error);
        return;
      }

      if (exists) {
        setEmailError('An account with this email already exists');
      } else {
        setEmailError(null);
      }
    } catch (err) {
      console.error('Email check failed:', err);
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  // Real-time phone validation using RPC function
  const checkPhoneExists = useCallback(async (phone: string) => {
    if (!phone || phone.length < 5) {
      setPhoneError(null);
      return;
    }
    
    setIsCheckingPhone(true);
    try {
      const dialCode = getCountryByCode(phoneCountry)?.dialCode || '';
      const fullPhone = dialCode + phone.replace(/\D/g, '');
      
      const { data: exists, error } = await supabase
        .rpc('check_phone_exists', { check_phone: fullPhone });

      if (error) {
        console.error('Phone check error:', error);
        return;
      }

      if (exists) {
        setPhoneError('An account with this phone number already exists');
      } else {
        setPhoneError(null);
      }
    } catch (err) {
      console.error('Phone check failed:', err);
    } finally {
      setIsCheckingPhone(false);
    }
  }, [phoneCountry]);

  // Debounced email check
  const handleEmailChange = (email: string) => {
    setSignupEmail(email);
    setEmailError(null);
    
    if (emailDebounceRef.current) {
      clearTimeout(emailDebounceRef.current);
    }
    
    emailDebounceRef.current = setTimeout(() => {
      checkEmailExists(email);
    }, 500);
  };

  // Debounced phone check
  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone);
    setPhoneError(null);
    
    if (phoneDebounceRef.current) {
      clearTimeout(phoneDebounceRef.current);
    }
    
    phoneDebounceRef.current = setTimeout(() => {
      checkPhoneExists(phone);
    }, 500);
  };

  // Re-check phone when country changes
  useEffect(() => {
    if (phoneNumber) {
      if (phoneDebounceRef.current) {
        clearTimeout(phoneDebounceRef.current);
      }
      phoneDebounceRef.current = setTimeout(() => {
        checkPhoneExists(phoneNumber);
      }, 500);
    }
  }, [phoneCountry, phoneNumber, checkPhoneExists]);

  const getFullPhoneNumber = () => {
    if (!phoneNumber) return '';
    const dialCode = getCountryByCode(phoneCountry)?.dialCode || '';
    return dialCode + phoneNumber.replace(/\D/g, '');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (signInError) throw signInError;
      toast.success('Καλώς ήρθατε!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setResetEmailSent(true);
      toast.success('Ο σύνδεσμος επαναφοράς κωδικού στάλθηκε!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    // Check for existing validation errors
    if (emailError) {
      setError(emailError);
      setIsLoading(false);
      return;
    }

    if (phoneError) {
      setError(phoneError);
      setIsLoading(false);
      return;
    }

    const fullPhone = getFullPhoneNumber();

    try {
      // Check if email already exists using RPC function
      const { data: emailExists } = await supabase
        .rpc('check_email_exists', { check_email: signupEmail.toLowerCase().trim() });

      if (emailExists) {
        setError('An account with this email already exists');
        setEmailError('An account with this email already exists');
        setIsLoading(false);
        return;
      }

      // Check if phone already exists (only if phone provided)
      if (fullPhone) {
        const { data: phoneExists } = await supabase
          .rpc('check_phone_exists', { check_phone: fullPhone });

        if (phoneExists) {
          setError('An account with this phone number already exists');
          setPhoneError('An account with this phone number already exists');
          setIsLoading(false);
          return;
        }
      }

      // Pass user metadata during signup so the trigger can use it
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone: fullPhone || null,
            address_line1: addressLine1,
            address_line2: addressLine2,
            city,
            state,
            postal_code: postalCode,
            country,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Mark that we just signed up to prevent auto-redirect
        setJustSignedUp(true);
        
        // Wait a moment for the trigger to create the profile, then update it
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update profile with additional info
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            phone: fullPhone || null,
            address_line1: addressLine1,
            address_line2: addressLine2,
            city,
            state,
            postal_code: postalCode,
            country,
          })
          .eq('user_id', data.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        // Sign out the user so they can verify their email first
        await supabase.auth.signOut();
        
        // Reset form
        setSignupEmail('');
        setSignupPassword('');
        setConfirmPassword('');
        setFullName('');
        setPhoneNumber('');
        setPhoneCountry('US');
        setAddressLine1('');
        setAddressLine2('');
        setCity('');
        setState('');
        setPostalCode('');
        setCountry('US');
        setEmailError(null);
        setPhoneError(null);
        setJustSignedUp(false);
        
        // Set verification message and switch to login tab
        setVerificationMessage('Ο λογαριασμός δημιουργήθηκε! Ελέγξτε το email σας για να επιβεβαιώσετε τον λογαριασμό σας πριν συνδεθείτε.');
        setActiveTab('login');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      // Handle Supabase auth duplicate email error
      if (message.includes('already registered') || message.includes('already exists')) {
        setError('An account with this email already exists');
        setEmailError('An account with this email already exists');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Πίσω στην Αρχική
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-8"
          >
            {showForgotPassword ? (
              <div>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    setError(null);
                  }}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Πίσω στη Σύνδεση
                </button>

                <h2 className="text-2xl font-bold text-foreground mb-2">Επαναφορά Κωδικού</h2>
                <p className="text-muted-foreground mb-6">
                  Εισάγετε το email σας και θα σας στείλουμε σύνδεσμο επαναφοράς κωδικού.
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {resetEmailSent ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Ελέγξτε το email σας</h3>
                    <p className="text-muted-foreground">
                      Στείλαμε σύνδεσμο επαναφοράς κωδικού στο <strong>{forgotEmail}</strong>
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="you@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Αποστολή...
                      </>
                    ) : (
                      'Αποστολή Συνδέσμου'
                      )}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(null); setVerificationMessage(null); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Σύνδεση</TabsTrigger>
                  <TabsTrigger value="signup">Εγγραφή</TabsTrigger>
                </TabsList>

                {verificationMessage && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-600 dark:text-green-400">{verificationMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Σύνδεση...
                      </>
                    ) : (
                      'Σύνδεση'
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Ξεχάσατε τον κωδικό σας;
                    </button>
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">ή</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      setError(null);
                      const { error } = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin,
                      });
                      if (error) {
                        setError(error.message || 'Η σύνδεση με Google απέτυχε');
                      }
                      setIsLoading(false);
                    }}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Σύνδεση με Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      setError(null);
                      const { error } = await lovable.auth.signInWithOAuth("apple", {
                        redirect_uri: window.location.origin,
                      });
                      if (error) {
                        setError(error.message || 'Η σύνδεση με Apple απέτυχε');
                      }
                      setIsLoading(false);
                    }}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Σύνδεση με Apple
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="signup-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className={`pl-10 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                          required
                        />
                        {isCheckingEmail && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      {emailError && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {emailError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Κωδικός *</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Επιβεβαίωση *</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-span-2 border-t border-border pt-4 mt-2">
                      <h3 className="text-sm font-medium text-foreground mb-4">Στοιχεία Αποστολής (Προαιρετικά)</h3>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="full-name">Ονοματεπώνυμο</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="full-name"
                          placeholder="Γιάννης Παπαδόπουλος"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="phone">Τηλέφωνο</Label>
                      <div className="flex gap-2">
                        <Select value={phoneCountry} onValueChange={setPhoneCountry}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue>
                              {getCountryByCode(phoneCountry)?.dialCode || '+1'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {countries.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.dialCode} {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="555 000 0000"
                            value={phoneNumber}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className={`pl-10 ${phoneError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                          />
                          {isCheckingPhone && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      {phoneError && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {phoneError}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address1">Διεύθυνση</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address1"
                          placeholder="Οδός Ερμού 15"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address2">Διεύθυνση 2</Label>
                      <Input
                        id="address2"
                        placeholder="Όροφος 2"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Πόλη</Label>
                      <Input
                        id="city"
                        placeholder="Αθήνα"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Περιοχή</Label>
                      <Input
                        id="state"
                        placeholder="Αττική"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal">Τ.Κ.</Label>
                      <Input
                        id="postal"
                        placeholder="10563"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Χώρα</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Επιλέξτε χώρα" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {countries.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !!emailError || !!phoneError}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Δημιουργία λογαριασμού...
                      </>
                    ) : (
                      'Δημιουργία Λογαριασμού'
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">ή</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      setError(null);
                      const { error } = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin,
                      });
                      if (error) {
                        setError(error.message || 'Η σύνδεση με Google απέτυχε');
                      }
                      setIsLoading(false);
                    }}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Εγγραφή με Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      setError(null);
                      const { error } = await lovable.auth.signInWithOAuth("apple", {
                        redirect_uri: window.location.origin,
                      });
                      if (error) {
                        setError(error.message || 'Η σύνδεση με Apple απέτυχε');
                      }
                      setIsLoading(false);
                    }}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Εγγραφή με Apple
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;