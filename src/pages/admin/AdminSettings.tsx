import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, CreditCard, Bell, Shield, Palette, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  email_notifications: boolean;
  two_factor_auth: boolean;
  international_shipping: boolean;
  dark_mode: boolean;
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

const AdminSettings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    store_name: '',
    contact_email: '',
    support_phone: '',
    office_address: '',
    currency: 'USD',
    tax_rate: '0',
    shipping_cost: '0',
    free_shipping_threshold: '0',
    standard_shipping_days_min: '5',
    standard_shipping_days_max: '7',
    express_shipping_cost: '14.99',
    express_shipping_days_min: '1',
    express_shipping_days_max: '3',
    email_notifications: true,
    two_factor_auth: false,
    international_shipping: true,
    dark_mode: true,
  });
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

        setSettings({
          store_name: settingsMap.store_name || '',
          contact_email: settingsMap.contact_email || '',
          support_phone: settingsMap.support_phone || '',
          office_address: settingsMap.office_address || '',
          currency: settingsMap.currency || 'USD',
          tax_rate: settingsMap.tax_rate || '0',
          shipping_cost: settingsMap.shipping_cost || '0',
          free_shipping_threshold: settingsMap.free_shipping_threshold || '0',
          standard_shipping_days_min: settingsMap.standard_shipping_days_min || '5',
          standard_shipping_days_max: settingsMap.standard_shipping_days_max || '7',
          express_shipping_cost: settingsMap.express_shipping_cost || '14.99',
          express_shipping_days_min: settingsMap.express_shipping_days_min || '1',
          express_shipping_days_max: settingsMap.express_shipping_days_max || '3',
          email_notifications: settingsMap.email_notifications === 'true',
          two_factor_auth: settingsMap.two_factor_auth === 'true',
          international_shipping: settingsMap.international_shipping === 'true',
          dark_mode: settingsMap.dark_mode === 'true',
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
      // First try to update
      const { error: updateError } = await supabase
        .from('settings')
        .update({ value })
        .eq('key', key);

      if (updateError) {
        // If update fails (no rows matched), insert instead
        const { error: insertError } = await supabase
          .from('settings')
          .insert({ key, value });
        
        if (insertError) throw insertError;
      }
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

  const settingsSections = [
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
        { key: 'tax_rate' as const, label: 'Tax Rate (%)', type: 'number', placeholder: '0', hint: 'Applied to subtotal' },
        { key: 'shipping_cost' as const, label: 'Standard Shipping Cost', type: 'price', placeholder: '0.00', hint: 'Flat rate for standard shipping' },
        { key: 'free_shipping_threshold' as const, label: 'Free Shipping Threshold', type: 'price', placeholder: '0.00', hint: 'Orders above this amount get free shipping (0 = disabled)' },
        { key: 'standard_shipping_days_min' as const, label: 'Standard Shipping (Min Days)', type: 'number', placeholder: '5', hint: 'Minimum delivery days for standard shipping' },
        { key: 'standard_shipping_days_max' as const, label: 'Standard Shipping (Max Days)', type: 'number', placeholder: '7', hint: 'Maximum delivery days for standard shipping' },
        { key: 'express_shipping_cost' as const, label: 'Express Shipping Cost', type: 'price', placeholder: '14.99', hint: 'Flat rate for express shipping' },
        { key: 'express_shipping_days_min' as const, label: 'Express Shipping (Min Days)', type: 'number', placeholder: '1', hint: 'Minimum delivery days for express shipping' },
        { key: 'express_shipping_days_max' as const, label: 'Express Shipping (Max Days)', type: 'number', placeholder: '3', hint: 'Maximum delivery days for express shipping' },
      ],
    },
  ];

  const toggleSettings = [
    { key: 'email_notifications' as const, icon: Bell, title: 'Email Notifications', description: 'Receive email alerts for new orders' },
    { key: 'two_factor_auth' as const, icon: Shield, title: 'Two-Factor Authentication', description: 'Add an extra layer of security' },
    { key: 'international_shipping' as const, icon: Globe, title: 'International Shipping', description: 'Enable shipping to international addresses' },
    { key: 'dark_mode' as const, icon: Palette, title: 'Dark Mode', description: 'Use dark theme for admin panel' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your store configuration</p>
      </div>

      <div className="space-y-8 max-w-3xl">
        {/* Form Settings */}
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
              {section.fields.map((field) => (
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
                  ) : (
                    <div>
                      <Input 
                        type="number"
                        value={settings[field.key] as string}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={(field as any).placeholder || '0'}
                        min="0"
                        max={field.type === 'number' ? '100' : undefined}
                        step={field.type === 'price' ? '0.01' : '0.01'}
                      />
                      {(field as any).hint && (
                        <p className="text-xs text-muted-foreground mt-1">{(field as any).hint}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <Button 
                onClick={() => handleSaveSection(section.fields.map(f => f.key))}
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
        ))}

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
      </div>
    </div>
  );
};

export default AdminSettings;