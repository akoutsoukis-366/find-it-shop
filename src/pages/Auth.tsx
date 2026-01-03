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
  const [phoneCountry, setPhoneCountry] = useState('US');
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

  // Real-time email validation
  const checkEmailExists = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailError(null);
      return;
    }
    
    setIsCheckingEmail(true);
    try {
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (existingEmail) {
        setEmailError('An account with this email already exists');
      } else {
        setEmailError(null);
      }
    } catch {
      // Silently fail validation check
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  // Real-time phone validation
  const checkPhoneExists = useCallback(async (phone: string) => {
    if (!phone || phone.length < 5) {
      setPhoneError(null);
      return;
    }
    
    setIsCheckingPhone(true);
    try {
      const dialCode = getCountryByCode(phoneCountry)?.dialCode || '';
      const fullPhone = dialCode + phone.replace(/\D/g, '');
      
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', fullPhone)
        .maybeSingle();

      if (existingPhone) {
        setPhoneError('An account with this phone number already exists');
      } else {
        setPhoneError(null);
      }
    } catch {
      // Silently fail validation check
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
      toast.success('Welcome back!');
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
      toast.success('Password reset email sent!');
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
      // Check if email already exists in profiles
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', signupEmail.toLowerCase().trim())
        .maybeSingle();

      if (existingEmail) {
        setError('An account with this email already exists');
        setEmailError('An account with this email already exists');
        setIsLoading(false);
        return;
      }

      // Check if phone already exists (only if phone provided)
      if (fullPhone) {
        const { data: existingPhone } = await supabase
          .from('profiles')
          .select('phone')
          .eq('phone', fullPhone)
          .maybeSingle();

        if (existingPhone) {
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
        setVerificationMessage('Account created successfully! Please check your email to verify your account before logging in.');
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
            Back to Home
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
                  Back to Login
                </button>

                <h2 className="text-2xl font-bold text-foreground mb-2">Reset Password</h2>
                <p className="text-muted-foreground mb-6">
                  Enter your email address and we'll send you a link to reset your password.
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
                    <h3 className="text-xl font-semibold text-foreground mb-2">Check your email</h3>
                    <p className="text-muted-foreground">
                      We've sent a password reset link to <strong>{forgotEmail}</strong>
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
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(null); setVerificationMessage(null); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
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
                      <Label htmlFor="signup-password">Password *</Label>
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
                      <Label htmlFor="confirm-password">Confirm *</Label>
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
                      <h3 className="text-sm font-medium text-foreground mb-4">Shipping Details (Optional)</h3>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="full-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="full-name"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="phone">Phone</Label>
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
                      <Label htmlFor="address1">Address Line 1</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address1"
                          placeholder="123 Main St"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address2">Address Line 2</Label>
                      <Input
                        id="address2"
                        placeholder="Apt 4B"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal">Postal Code</Label>
                      <Input
                        id="postal"
                        placeholder="10001"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select country" />
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
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
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