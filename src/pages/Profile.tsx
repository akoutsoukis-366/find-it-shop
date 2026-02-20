import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Loader2, Save, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Profile {
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'GR',
  });

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setEmail(session.user.email || '');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          state: data.state || '',
          postal_code: data.postal_code || '',
          country: data.country || 'GR',
        });
      }

      setLoading(false);
    };

    checkAuthAndFetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast.success('Το προφίλ ενημερώθηκε επιτυχώς');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Αποτυχία ενημέρωσης προφίλ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await supabase.auth.signOut();
      toast.success('Ο λογαριασμός σας διαγράφηκε');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Αποτυχία διαγραφής λογαριασμού. Δοκιμάστε ξανά.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Πίσω στην Αρχική
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-8"
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">Το Προφίλ μου</h1>
            <p className="text-muted-foreground mb-8">Διαχειριστείτε τα στοιχεία του λογαριασμού και τη διεύθυνση αποστολής σας</p>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full-name">Ονοματεπώνυμο</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full-name"
                    placeholder="Γιάννης Παπαδόπουλος"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Τηλέφωνο</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+30 210 0000000"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6 mt-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Διεύθυνση Αποστολής</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address1">Διεύθυνση 1</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address1"
                        placeholder="Οδός & Αριθμός"
                        value={profile.address_line1 || ''}
                        onChange={(e) => setProfile({ ...profile, address_line1: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address2">Διεύθυνση 2</Label>
                    <Input
                      id="address2"
                      placeholder="Όροφος, Διαμέρισμα"
                      value={profile.address_line2 || ''}
                      onChange={(e) => setProfile({ ...profile, address_line2: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Πόλη</Label>
                    <Input
                      id="city"
                      placeholder="Αθήνα"
                      value={profile.city || ''}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Περιφέρεια</Label>
                    <Input
                      id="state"
                      placeholder="Αττική"
                      value={profile.state || ''}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal">Τ.Κ.</Label>
                    <Input
                      id="postal"
                      placeholder="10563"
                      value={profile.postal_code || ''}
                      onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Χώρα</Label>
                    <Input
                      id="country"
                      placeholder="GR"
                      value={profile.country || ''}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full mt-6">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Αποθήκευση...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Αποθήκευση Αλλαγών
                  </>
                )}
              </Button>

              {/* Delete Account Section */}
              <div className="border-t border-destructive/20 pt-6 mt-8">
                <h2 className="text-lg font-semibold text-destructive mb-2">Επικίνδυνη Ζώνη</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Μόλις διαγράψετε τον λογαριασμό σας, δεν υπάρχει επιστροφή. Σιγουρευτείτε πριν προχωρήσετε.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={deleting}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Διαγραφή Λογαριασμού
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Διαγραφή Λογαριασμού
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Θα διαγράψει μόνιμα τον λογαριασμό σας
                        και θα αφαιρέσει όλα τα δεδομένα σας, συμπεριλαμβανομένου του προφίλ, του ιστορικού παραγγελιών
                        και κάθε άλλης σχετικής πληροφορίας.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleting}
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Διαγραφή...
                          </>
                        ) : (
                          'Ναι, διέγραψε τον λογαριασμό μου'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;