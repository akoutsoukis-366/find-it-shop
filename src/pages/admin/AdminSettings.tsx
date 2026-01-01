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

interface SettingsData {
  store_name: string;
  contact_email: string;
  support_phone: string;
  office_address: string;
  currency: string;
  tax_rate: string;
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
  // Image URLs
  hero_image_url: string;
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
  tax_rate: '24',
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
  // Image URLs
  hero_image_url: '',
  logo_url: '',
  // Homepage content
  hero_badge_text: 'New: iTag Ultra now available',
  hero_title_line1: 'Never Lose',
  hero_title_line2: 'What Matters',
  hero_description: 'Premium tracking devices that seamlessly connect with your iPhone. Find your keys, wallet, luggage, and more with precision accuracy.',
  hero_stat1_value: '1M+',
  hero_stat1_label: 'Items Found',
  hero_stat2_value: '4.9',
  hero_stat2_label: 'Rating',
  hero_stat3_value: '500k+',
  hero_stat3_label: 'Happy Users',
  features_title: 'Why Choose iTag?',
  features_subtitle: 'Built with cutting-edge technology and designed for your peace of mind.',
  feature1_title: 'Precision Location',
  feature1_description: 'Find your items with pinpoint accuracy using our advanced tracking technology.',
  feature2_title: 'Ultra-Fast Connection',
  feature2_description: 'Instant pairing with your iPhone. Set up in seconds, track for years.',
  feature3_title: 'Privacy First',
  feature3_description: 'End-to-end encrypted. Only you can see the location of your items.',
  featured_products_title: 'Featured Products',
  featured_products_subtitle: 'Our most popular tracking devices',
  cta_title_line1: 'Ready to Never Lose',
  cta_title_line2: 'Your Essentials Again?',
  cta_description: 'Join over 500,000 happy customers who trust iTag to keep their valuables safe.',
  cta_button_text: 'Start Shopping',
  // About page content
  about_hero_title_line1: 'Our Mission is to',
  about_hero_title_line2: 'Bring Peace of Mind',
  about_hero_description: "We believe no one should have to worry about losing their valuables. That's why we created iTag – the most reliable way to keep track of what matters most.",
  about_stat1_value: '500K+',
  about_stat1_label: 'Happy Customers',
  about_stat2_value: '1M+',
  about_stat2_label: 'Items Found',
  about_stat3_value: '99.9%',
  about_stat3_label: 'Success Rate',
  about_stat4_value: '4.9',
  about_stat4_label: 'App Rating',
  about_story_title: 'Our Story',
  about_story_paragraph1: "iTag was born from a simple frustration – we've all been there, frantically searching for keys when running late or worrying about lost luggage while traveling.",
  about_story_paragraph2: 'Founded in 2020, our team of engineers and designers set out to create the most reliable, user-friendly tracking device on the market. Today, iTag helps hundreds of thousands of people keep track of their most important items.',
  about_story_paragraph3: "We're constantly innovating, pushing the boundaries of what's possible with location technology while maintaining our commitment to privacy and security.",
  about_story_box_title: 'Never Lose Track',
  about_story_box_subtitle: 'Of what matters most to you',
  about_values_title: 'Our Values',
  about_values_subtitle: 'The principles that guide everything we do',
  about_value1_title: 'Privacy First',
  about_value1_description: 'Your location data is end-to-end encrypted. Only you have access.',
  about_value2_title: 'Innovation',
  about_value2_description: "Cutting-edge technology that pushes the boundaries of what's possible.",
  about_value3_title: 'Customer Focus',
  about_value3_description: "Every product decision starts with our customers' needs.",
  about_contact_title: 'Get in Touch',
  about_contact_subtitle: "Have questions? We'd love to hear from you.",
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
      description: 'Configure currency, tax rates, and shipping options',
      fields: [
        { key: 'currency' as const, label: 'Currency', type: 'currency' },
        { key: 'tax_rate' as const, label: 'Tax Rate (%)', type: 'number', placeholder: '24', hint: 'Applied to subtotal' },
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

  const toggleSettings = [
    { key: 'email_notifications' as const, icon: Bell, title: 'Email Notifications', description: 'Receive email alerts for new orders' },
    { key: 'two_factor_auth' as const, icon: Shield, title: 'Two-Factor Authentication', description: 'Add an extra layer of security' },
    { key: 'international_shipping' as const, icon: Globe, title: 'International Shipping', description: 'Enable shipping to international addresses' },
    { key: 'dark_mode' as const, icon: Palette, title: 'Dark Mode', description: 'Use dark theme for admin panel' },
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
      </Tabs>
    </div>
  );
};

export default AdminSettings;
