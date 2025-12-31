import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicSettings {
  store_name: string;
  contact_email: string;
  support_phone: string;
  currency: string;
  office_address: string;
}

const defaultSettings: PublicSettings = {
  store_name: 'iTag Store',
  contact_email: 'support@itag.com',
  support_phone: '+1 (555) 123-4567',
  currency: 'USD',
  office_address: 'San Francisco, CA',
};

export const usePublicSettings = () => {
  const [settings, setSettings] = useState<PublicSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['store_name', 'contact_email', 'support_phone', 'currency', 'office_address']);

        if (error) throw error;

        if (data && data.length > 0) {
          const settingsMap: Record<string, string> = {};
          data.forEach((item: { key: string; value: string | null }) => {
            settingsMap[item.key] = item.value || '';
          });

          setSettings({
            store_name: settingsMap.store_name || defaultSettings.store_name,
            contact_email: settingsMap.contact_email || defaultSettings.contact_email,
            support_phone: settingsMap.support_phone || defaultSettings.support_phone,
            currency: settingsMap.currency || defaultSettings.currency,
            office_address: settingsMap.office_address || defaultSettings.office_address,
          });
        }
      } catch (error) {
        console.error('Error fetching public settings:', error);
        // Keep default settings on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, isLoading };
};
