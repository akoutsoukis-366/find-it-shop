import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, CreditCard, Bell, Shield, Palette, Globe, Loader2, FileText, Home, Info, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';
import VideoUpload from '@/components/admin/VideoUpload';

interface SettingsData {
  store_name: string;
  contact_email: string;
  support_phone: string;
  office_address: string;
  currency: string;
  shipping_cost: string;
  free_shipping_threshold: string;
  standard_shipping_days_min: string;
  standard_shipping_days_max: string;
  express_shipping_cost: string;
  express_shipping_days_min: string;
  express_shipping_days_max: string;
  warranty_years: string;
  return_days: string;
  email_notifications: boolean;
  two_factor_auth: boolean;
  international_shipping: boolean;
  dark_mode: boolean;
  // Image & Video URLs
  hero_image_url: string;
  hero_video_url: string;
  logo_url: string;
  // Homepage content
  hero_badge_text: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_description: string;
  hero_stat1_value: string;
  hero_stat1_label: string;
  hero_stat2_value: string;
  hero_stat2_label: string;
  hero_stat3_value: string;
  hero_stat3_label: string;
  features_title: string;
  features_subtitle: string;
  feature1_title: string;
  feature1_description: string;
  feature2_title: string;
  feature2_description: string;
  feature3_title: string;
  feature3_description: string;
  featured_products_title: string;
  featured_products_subtitle: string;
  cta_title_line1: string;
  cta_title_line2: string;
  cta_description: string;
  cta_button_text: string;
  // About page content
  about_hero_title_line1: string;
  about_hero_title_line2: string;
  about_hero_description: string;
  about_stat1_value: string;
  about_stat1_label: string;
  about_stat2_value: string;
  about_stat2_label: string;
  about_stat3_value: string;
  about_stat3_label: string;
  about_stat4_value: string;
  about_stat4_label: string;
  about_story_title: string;
  about_story_paragraph1: string;
  about_story_paragraph2: string;
  about_story_paragraph3: string;
  about_story_box_title: string;
  about_story_box_subtitle: string;
  about_values_title: string;
  about_values_subtitle: string;
  about_value1_title: string;
  about_value1_description: string;
  about_value2_title: string;
  about_value2_description: string;
  about_value3_title: string;
  about_value3_description: string;
  about_contact_title: string;
  about_contact_subtitle: string;
  // Footer
  footer_description: string;
  // Trust signals
  trust1_title: string;
  trust1_description: string;
  trust2_title: string;
  trust2_description: string;
  trust3_title: string;
  trust3_description: string;
  trust4_title: string;
  trust4_description: string;
  // Legal pages
  privacy_title: string;
  privacy_content: string;
  terms_title: string;
  terms_content: string;
  shipping_title: string;
  shipping_content: string;
}

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

const defaultSettings: SettingsData = {
  store_name: '',
  contact_email: '',
  support_phone: '',
  office_address: '',
  currency: 'EUR',
  shipping_cost: '9.99',
  free_shipping_threshold: '50',
  standard_shipping_days_min: '5',
  standard_shipping_days_max: '7',
  express_shipping_cost: '14.99',
  express_shipping_days_min: '1',
  express_shipping_days_max: '3',
  warranty_years: '2',
  return_days: '30',
  email_notifications: true,
  two_factor_auth: false,
  international_shipping: true,
  dark_mode: true,
  // Image & Video URLs
  hero_image_url: '',
  hero_video_url: '',
  logo_url: '',
  // Homepage content
  hero_badge_text: '',
  hero_title_line1: '',
  hero_title_line2: '',
  hero_description: '',
  hero_stat1_value: '',
  hero_stat1_label: '',
  hero_stat2_value: '',
  hero_stat2_label: '',
  hero_stat3_value: '',
  hero_stat3_label: '',
  features_title: '',
  features_subtitle: '',
  feature1_title: '',
  feature1_description: '',
  feature2_title: '',
  feature2_description: '',
  feature3_title: '',
  feature3_description: '',
  featured_products_title: '',
  featured_products_subtitle: '',
  cta_title_line1: '',
  cta_title_line2: '',
  cta_description: '',
  cta_button_text: '',
  // About page content
  about_hero_title_line1: '',
  about_hero_title_line2: '',
  about_hero_description: '',
  about_stat1_value: '',
  about_stat1_label: '',
  about_stat2_value: '',
  about_stat2_label: '',
  about_stat3_value: '',
  about_stat3_label: '',
  about_stat4_value: '',
  about_stat4_label: '',
  about_story_title: '',
  about_story_paragraph1: '',
  about_story_paragraph2: '',
  about_story_paragraph3: '',
  about_story_box_title: '',
  about_story_box_subtitle: '',
  about_values_title: '',
  about_values_subtitle: '',
  about_value1_title: '',
  about_value1_description: '',
  about_value2_title: '',
  about_value2_description: '',
  about_value3_title: '',
  about_value3_description: '',
  about_contact_title: '',
  about_contact_subtitle: '',
  // Footer
  footer_description: '',
  // Trust signals
  trust1_title: '',
  trust1_description: '',
  trust2_title: '',
  trust2_description: '',
  trust3_title: '',
  trust3_description: '',
  trust4_title: '',
  trust4_description: '',
  // Legal pages
  privacy_title: 'Πολιτική Απορρήτου',
  privacy_content: '',
  terms_title: 'Όροι Χρήσης',
  terms_content: '',
  shipping_title: 'Πολιτική Αποστολών',
  shipping_content: '',
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach((item: { key: string; value: string | null }) => {
          settingsMap[item.key] = item.value || '';
        });

        setSettings(prev => {
          const updated = { ...prev };
          for (const key of Object.keys(defaultSettings)) {
            if (settingsMap[key] !== undefined && settingsMap[key] !== '') {
              if (key === 'email_notifications' || key === 'two_factor_auth' || key === 'international_shipping' || key === 'dark_mode') {
                (updated as any)[key] = settingsMap[key] === 'true';
              } else {
                (updated as any)[key] = settingsMap[key];
              }
            }
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  const handleInputChange = (key: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleChange = async (key: keyof SettingsData, checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
    
    try {
      await updateSetting(key, String(checked));
      toast.success('Setting updated');
    } catch {
      toast.error('Failed to update setting');
      setSettings(prev => ({ ...prev, [key]: !checked }));
    }
  };

  const handleSaveSection = async (keys: (keyof SettingsData)[]) => {
    setIsSaving(true);
    try {
      for (const key of keys) {
        await updateSetting(key, String(settings[key]));
      }
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const storeSettingsSections = [
    {
      icon: Store,
      title: 'Store Information',
      description: 'Update your store name, description, and contact details',
      fields: [
        { key: 'store_name' as const, label: 'Store Name', type: 'text' },
        { key: 'contact_email' as const, label: 'Contact Email', type: 'email' },
        { key: 'support_phone' as const, label: 'Support Phone', type: 'tel' },
        { key: 'office_address' as const, label: 'Office Address', type: 'text' },
      ],
    },
    {
      icon: CreditCard,
      title: 'Payment & Shipping',
      description: 'Configure currency and shipping options',
      fields: [
        { key: 'currency' as const, label: 'Currency', type: 'currency' },
        { key: 'shipping_cost' as const, label: 'Standard Shipping Cost', type: 'price', placeholder: '9.99', hint: 'Flat rate for standard shipping' },
        { key: 'free_shipping_threshold' as const, label: 'Free Shipping Threshold', type: 'price', placeholder: '50', hint: 'Orders above this amount get free shipping (0 = disabled)' },
        { key: 'standard_shipping_days_min' as const, label: 'Standard Shipping (Min Days)', type: 'number', placeholder: '5' },
        { key: 'standard_shipping_days_max' as const, label: 'Standard Shipping (Max Days)', type: 'number', placeholder: '7' },
        { key: 'express_shipping_cost' as const, label: 'Express Shipping Cost', type: 'price', placeholder: '14.99' },
        { key: 'express_shipping_days_min' as const, label: 'Express Shipping (Min Days)', type: 'number', placeholder: '1' },
        { key: 'express_shipping_days_max' as const, label: 'Express Shipping (Max Days)', type: 'number', placeholder: '3' },
        { key: 'warranty_years' as const, label: 'Warranty (Years)', type: 'number', placeholder: '2' },
        { key: 'return_days' as const, label: 'Return Policy (Days)', type: 'number', placeholder: '30' },
      ],
    },
  ];

  const homepageContentSections = [
    {
      icon: Home,
      title: 'Hero Section',
      description: 'Main hero content on the homepage',
      fields: [
        { key: 'hero_badge_text' as const, label: 'Badge Text', type: 'text' },
        { key: 'hero_title_line1' as const, label: 'Title Line 1', type: 'text' },
        { key: 'hero_title_line2' as const, label: 'Title Line 2 (Gradient)', type: 'text' },
        { key: 'hero_description' as const, label: 'Description', type: 'textarea' },
        { key: 'hero_stat1_value' as const, label: 'Stat 1 Value', type: 'text' },
        { key: 'hero_stat1_label' as const, label: 'Stat 1 Label', type: 'text' },
        { key: 'hero_stat2_value' as const, label: 'Stat 2 Value', type: 'text' },
        { key: 'hero_stat2_label' as const, label: 'Stat 2 Label', type: 'text' },
        { key: 'hero_stat3_value' as const, label: 'Stat 3 Value', type: 'text' },
        { key: 'hero_stat3_label' as const, label: 'Stat 3 Label', type: 'text' },
      ],
    },
    {
      icon: FileText,
      title: 'Features Section',
      description: 'Why Choose section with 3 feature cards',
      fields: [
        { key: 'features_title' as const, label: 'Section Title', type: 'text' },
        { key: 'features_subtitle' as const, label: 'Section Subtitle', type: 'text' },
        { key: 'feature1_title' as const, label: 'Feature 1 Title', type: 'text' },
        { key: 'feature1_description' as const, label: 'Feature 1 Description', type: 'textarea' },
        { key: 'feature2_title' as const, label: 'Feature 2 Title', type: 'text' },
        { key: 'feature2_description' as const, label: 'Feature 2 Description', type: 'textarea' },
        { key: 'feature3_title' as const, label: 'Feature 3 Title', type: 'text' },
        { key: 'feature3_description' as const, label: 'Feature 3 Description', type: 'textarea' },
      ],
    },
    {
      icon: FileText,
      title: 'Featured Products Section',
      description: 'Featured products section title and subtitle',
      fields: [
        { key: 'featured_products_title' as const, label: 'Section Title', type: 'text' },
        { key: 'featured_products_subtitle' as const, label: 'Section Subtitle', type: 'text' },
      ],
    },
    {
      icon: FileText,
      title: 'Call to Action Section',
      description: 'Bottom CTA section on homepage',
      fields: [
        { key: 'cta_title_line1' as const, label: 'Title Line 1', type: 'text' },
        { key: 'cta_title_line2' as const, label: 'Title Line 2 (Gradient)', type: 'text' },
        { key: 'cta_description' as const, label: 'Description', type: 'textarea' },
        { key: 'cta_button_text' as const, label: 'Button Text', type: 'text' },
      ],
    },
    {
      icon: FileText,
      title: 'Footer',
      description: 'Footer content displayed at the bottom of every page',
      fields: [
        { key: 'footer_description' as const, label: 'Footer Description', type: 'textarea' },
      ],
    },
    {
      icon: FileText,
      title: 'Trust Signals',
      description: 'Trust badges displayed between hero and categories',
      fields: [
        { key: 'trust1_title' as const, label: 'Signal 1 Title', type: 'text' },
        { key: 'trust1_description' as const, label: 'Signal 1 Description', type: 'text' },
        { key: 'trust2_title' as const, label: 'Signal 2 Title', type: 'text' },
        { key: 'trust2_description' as const, label: 'Signal 2 Description', type: 'text' },
        { key: 'trust3_title' as const, label: 'Signal 3 Title', type: 'text' },
        { key: 'trust3_description' as const, label: 'Signal 3 Description', type: 'text' },
        { key: 'trust4_title' as const, label: 'Signal 4 Title', type: 'text' },
        { key: 'trust4_description' as const, label: 'Signal 4 Description', type: 'text' },
      ],
    },
  ];

  const aboutContentSections = [
    {
      icon: Info,
      title: 'Hero Section',
      description: 'Main hero content on the about page',
      fields: [
        { key: 'about_hero_title_line1' as const, label: 'Title Line 1', type: 'text' },
        { key: 'about_hero_title_line2' as const, label: 'Title Line 2 (Gradient)', type: 'text' },
        { key: 'about_hero_description' as const, label: 'Description', type: 'textarea' },
      ],
    },
    {
      icon: FileText,
      title: 'Statistics',
      description: 'Stats displayed on the about page',
      fields: [
        { key: 'about_stat1_value' as const, label: 'Stat 1 Value', type: 'text' },
        { key: 'about_stat1_label' as const, label: 'Stat 1 Label', type: 'text' },
        { key: 'about_stat2_value' as const, label: 'Stat 2 Value', type: 'text' },
        { key: 'about_stat2_label' as const, label: 'Stat 2 Label', type: 'text' },
        { key: 'about_stat3_value' as const, label: 'Stat 3 Value', type: 'text' },
        { key: 'about_stat3_label' as const, label: 'Stat 3 Label', type: 'text' },
        { key: 'about_stat4_value' as const, label: 'Stat 4 Value', type: 'text' },
        { key: 'about_stat4_label' as const, label: 'Stat 4 Label', type: 'text' },
      ],
    },
    {
      icon: FileText,
      title: 'Our Story',
      description: 'Company story section',
      fields: [
        { key: 'about_story_title' as const, label: 'Section Title', type: 'text' },
        { key: 'about_story_paragraph1' as const, label: 'Paragraph 1', type: 'textarea' },
        { key: 'about_story_paragraph2' as const, label: 'Paragraph 2', type: 'textarea' },
        { key: 'about_story_paragraph3' as const, label: 'Paragraph 3', type: 'textarea' },
        { key: 'about_story_box_title' as const, label: 'Story Box Title', type: 'text' },
        { key: 'about_story_box_subtitle' as const, label: 'Story Box Subtitle', type: 'text' },
      ],
    },
    {
      icon: FileText,
      title: 'Our Values',
      description: 'Company values section',
      fields: [
        { key: 'about_values_title' as const, label: 'Section Title', type: 'text' },
        { key: 'about_values_subtitle' as const, label: 'Section Subtitle', type: 'text' },
        { key: 'about_value1_title' as const, label: 'Value 1 Title', type: 'text' },
        { key: 'about_value1_description' as const, label: 'Value 1 Description', type: 'textarea' },
        { key: 'about_value2_title' as const, label: 'Value 2 Title', type: 'text' },
        { key: 'about_value2_description' as const, label: 'Value 2 Description', type: 'textarea' },
        { key: 'about_value3_title' as const, label: 'Value 3 Title', type: 'text' },
        { key: 'about_value3_description' as const, label: 'Value 3 Description', type: 'textarea' },
      ],
    },
    {
      icon: FileText,
      title: 'Contact Section',
      description: 'Get in touch section heading',
      fields: [
        { key: 'about_contact_title' as const, label: 'Section Title', type: 'text' },
        { key: 'about_contact_subtitle' as const, label: 'Section Subtitle', type: 'text' },
      ],
    },
  ];

  const legalContentSections = [
    {
      icon: FileText,
      title: 'Πολιτική Απορρήτου',
      description: 'Περιεχόμενο σελίδας Πολιτικής Απορρήτου',
      fields: [
        { key: 'privacy_title' as const, label: 'Τίτλος Σελίδας', type: 'text' },
        { key: 'privacy_content' as const, label: 'Περιεχόμενο', type: 'textarea' },
      ],
    },
    {
      icon: FileText,
      title: 'Όροι Χρήσης',
      description: 'Περιεχόμενο σελίδας Όρων Χρήσης',
      fields: [
        { key: 'terms_title' as const, label: 'Τίτλος Σελίδας', type: 'text' },
        { key: 'terms_content' as const, label: 'Περιεχόμενο', type: 'textarea' },
      ],
    },
    {
      icon: FileText,
      title: 'Πολιτική Αποστολών',
      description: 'Περιεχόμενο σελίδας Αποστολών & Επιστροφών',
      fields: [
        { key: 'shipping_title' as const, label: 'Τίτλος Σελίδας', type: 'text' },
        { key: 'shipping_content' as const, label: 'Περιεχόμενο', type: 'textarea' },
      ],
    },
  ];

  const toggleSettings = [
    { key: 'email_notifications' as const, icon: Bell, title: 'Email Notifications', description: 'Send email alerts for orders and contact messages' },
    { key: 'two_factor_auth' as const, icon: Shield, title: 'Two-Factor Authentication', description: 'Coming soon — adds extra login security' },
    { key: 'international_shipping' as const, icon: Globe, title: 'International Shipping', description: 'Allow checkout shipping to international addresses' },
    { key: 'dark_mode' as const, icon: Palette, title: 'Dark Mode', description: 'Toggle dark/light theme for admin panel' },
  ];

  const renderSection = (section: any) => (
    <motion.div
      key={section.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <section.icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
          <p className="text-muted-foreground">{section.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {section.fields.map((field: any) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-foreground mb-2">
              {field.label}
            </label>
            {field.type === 'currency' ? (
              <Select
                value={settings[field.key] as string}
                onValueChange={(value) => handleInputChange(field.key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'textarea' ? (
              <Textarea
                value={settings[field.key] as string}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                placeholder={field.placeholder || ''}
                rows={3}
              />
            ) : (
              <div>
                <Input 
                  type={field.type === 'price' || field.type === 'number' ? 'number' : field.type}
                  value={settings[field.key] as string}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  min={field.type === 'number' || field.type === 'price' ? '0' : undefined}
                  step={field.type === 'price' ? '0.01' : field.type === 'number' ? '1' : undefined}
                />
                {field.hint && (
                  <p className="text-xs text-muted-foreground mt-1">{field.hint}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <Button 
          onClick={() => handleSaveSection(section.fields.map((f: any) => f.key))}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your store configuration and content</p>
      </div>

      <Tabs defaultValue="store" className="max-w-3xl">
        <TabsList className="mb-6">
          <TabsTrigger value="store">Store Settings</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="homepage">Homepage Content</TabsTrigger>
          <TabsTrigger value="about">About Page Content</TabsTrigger>
          <TabsTrigger value="legal">Νομικά</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-8">
          {storeSettingsSections.map(renderSection)}

          {/* Toggle Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            {toggleSettings.map((setting, index) => (
              <div
                key={setting.key}
                className={`flex items-center justify-between p-6 ${
                  index < toggleSettings.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <setting.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{setting.title}</div>
                    <div className="text-sm text-muted-foreground">{setting.description}</div>
                  </div>
                </div>
                <Switch 
                  checked={settings[setting.key] as boolean}
                  onCheckedChange={(checked) => handleToggleChange(setting.key, checked)}
                />
              </div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="images" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Image className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Site Images</h2>
                <p className="text-muted-foreground">Upload and manage site images</p>
              </div>
            </div>

            <div className="space-y-8">
              <ImageUpload
                value={settings.hero_image_url}
                onChange={async (url) => {
                  handleInputChange('hero_image_url', url);
                  try {
                    await updateSetting('hero_image_url', url);
                    toast.success('Hero image saved');
                  } catch {
                    toast.error('Failed to save hero image');
                  }
                }}
                label="Hero Image"
                description="Main hero image displayed on the homepage (recommended: 800x800px)"
                folder="hero"
              />

              <VideoUpload
                value={settings.hero_video_url}
                onChange={async (url) => {
                  handleInputChange('hero_video_url', url);
                  try {
                    await updateSetting('hero_video_url', url);
                    toast.success('Hero video saved');
                  } catch {
                    toast.error('Failed to save hero video');
                  }
                }}
                label="Hero Video"
                description="Main hero video/animation displayed on the homepage (MP4/WebM recommended)"
                folder="hero"
              />

              <ImageUpload
                value={settings.logo_url}
                onChange={async (url) => {
                  handleInputChange('logo_url', url);
                  try {
                    await updateSetting('logo_url', url);
                    toast.success('Logo saved');
                  } catch {
                    toast.error('Failed to save logo');
                  }
                }}
                label="Logo"
                description="Site logo displayed in the navbar and footer (recommended: 200x200px)"
                folder="logo"
              />
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-8">
          {homepageContentSections.map(renderSection)}
        </TabsContent>

        <TabsContent value="about" className="space-y-8">
          {aboutContentSections.map(renderSection)}
        </TabsContent>

        <TabsContent value="legal" className="space-y-8">
          {legalContentSections.map(renderSection)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
