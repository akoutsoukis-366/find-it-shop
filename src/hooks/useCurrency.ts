import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
}

const currencyMap: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  CNY: { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN' },
  CHF: { code: 'CHF', symbol: 'CHF', locale: 'de-CH' },
  SEK: { code: 'SEK', symbol: 'kr', locale: 'sv-SE' },
  NOK: { code: 'NOK', symbol: 'kr', locale: 'nb-NO' },
  DKK: { code: 'DKK', symbol: 'kr', locale: 'da-DK' },
  PLN: { code: 'PLN', symbol: 'zł', locale: 'pl-PL' },
  BRL: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
  MXN: { code: 'MXN', symbol: '$', locale: 'es-MX' },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
  HKD: { code: 'HKD', symbol: 'HK$', locale: 'zh-HK' },
  NZD: { code: 'NZD', symbol: 'NZ$', locale: 'en-NZ' },
  KRW: { code: 'KRW', symbol: '₩', locale: 'ko-KR' },
};

export const useCurrency = () => {
  const [currency, setCurrency] = useState<CurrencyConfig>(currencyMap.USD);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'currency')
          .maybeSingle();

        if (!error && data?.value) {
          const code = data.value.toUpperCase();
          setCurrency(currencyMap[code] || currencyMap.USD);
        }
      } catch (error) {
        console.error('Error fetching currency:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrency();
  }, []);

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.code === 'JPY' || currency.code === 'KRW' ? 0 : 2,
      maximumFractionDigits: currency.code === 'JPY' || currency.code === 'KRW' ? 0 : 2,
    }).format(amount);
  };

  return { currency, formatPrice, isLoading };
};
