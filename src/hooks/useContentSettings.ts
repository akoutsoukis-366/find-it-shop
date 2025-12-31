import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContentSettings {
  // Hero section
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
  // Features section
  features_title: string;
  features_subtitle: string;
  feature1_title: string;
  feature1_description: string;
  feature2_title: string;
  feature2_description: string;
  feature3_title: string;
  feature3_description: string;
  // Featured products section
  featured_products_title: string;
  featured_products_subtitle: string;
  // CTA section
  cta_title_line1: string;
  cta_title_line2: string;
  cta_description: string;
  cta_button_text: string;
  // About page hero
  about_hero_title_line1: string;
  about_hero_title_line2: string;
  about_hero_description: string;
  // About page stats
  about_stat1_value: string;
  about_stat1_label: string;
  about_stat2_value: string;
  about_stat2_label: string;
  about_stat3_value: string;
  about_stat3_label: string;
  about_stat4_value: string;
  about_stat4_label: string;
  // About page story
  about_story_title: string;
  about_story_paragraph1: string;
  about_story_paragraph2: string;
  about_story_paragraph3: string;
  about_story_box_title: string;
  about_story_box_subtitle: string;
  // About page values
  about_values_title: string;
  about_values_subtitle: string;
  about_value1_title: string;
  about_value1_description: string;
  about_value2_title: string;
  about_value2_description: string;
  about_value3_title: string;
  about_value3_description: string;
  // About page contact section
  about_contact_title: string;
  about_contact_subtitle: string;
}

const defaultContent: ContentSettings = {
  // Hero section
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
  // Features section
  features_title: 'Why Choose iTag?',
  features_subtitle: 'Built with cutting-edge technology and designed for your peace of mind.',
  feature1_title: 'Precision Location',
  feature1_description: 'Find your items with pinpoint accuracy using our advanced tracking technology.',
  feature2_title: 'Ultra-Fast Connection',
  feature2_description: 'Instant pairing with your iPhone. Set up in seconds, track for years.',
  feature3_title: 'Privacy First',
  feature3_description: 'End-to-end encrypted. Only you can see the location of your items.',
  // Featured products section
  featured_products_title: 'Featured Products',
  featured_products_subtitle: 'Our most popular tracking devices',
  // CTA section
  cta_title_line1: 'Ready to Never Lose',
  cta_title_line2: 'Your Essentials Again?',
  cta_description: 'Join over 500,000 happy customers who trust iTag to keep their valuables safe.',
  cta_button_text: 'Start Shopping',
  // About page hero
  about_hero_title_line1: 'Our Mission is to',
  about_hero_title_line2: 'Bring Peace of Mind',
  about_hero_description: "We believe no one should have to worry about losing their valuables. That's why we created iTag – the most reliable way to keep track of what matters most.",
  // About page stats
  about_stat1_value: '500K+',
  about_stat1_label: 'Happy Customers',
  about_stat2_value: '1M+',
  about_stat2_label: 'Items Found',
  about_stat3_value: '99.9%',
  about_stat3_label: 'Success Rate',
  about_stat4_value: '4.9',
  about_stat4_label: 'App Rating',
  // About page story
  about_story_title: 'Our Story',
  about_story_paragraph1: "iTag was born from a simple frustration – we've all been there, frantically searching for keys when running late or worrying about lost luggage while traveling.",
  about_story_paragraph2: 'Founded in 2020, our team of engineers and designers set out to create the most reliable, user-friendly tracking device on the market. Today, iTag helps hundreds of thousands of people keep track of their most important items.',
  about_story_paragraph3: "We're constantly innovating, pushing the boundaries of what's possible with location technology while maintaining our commitment to privacy and security.",
  about_story_box_title: 'Never Lose Track',
  about_story_box_subtitle: 'Of what matters most to you',
  // About page values
  about_values_title: 'Our Values',
  about_values_subtitle: 'The principles that guide everything we do',
  about_value1_title: 'Privacy First',
  about_value1_description: 'Your location data is end-to-end encrypted. Only you have access.',
  about_value2_title: 'Innovation',
  about_value2_description: "Cutting-edge technology that pushes the boundaries of what's possible.",
  about_value3_title: 'Customer Focus',
  about_value3_description: "Every product decision starts with our customers' needs.",
  // About page contact section
  about_contact_title: 'Get in Touch',
  about_contact_subtitle: "Have questions? We'd love to hear from you.",
};

export const useContentSettings = () => {
  const [content, setContent] = useState<ContentSettings>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const keys = Object.keys(defaultContent);
        const { data, error } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', keys);

        if (error) throw error;

        if (data && data.length > 0) {
          const contentMap: Record<string, string> = {};
          data.forEach((item: { key: string; value: string | null }) => {
            contentMap[item.key] = item.value || '';
          });

          setContent(prev => {
            const updated = { ...prev };
            for (const key of keys) {
              if (contentMap[key]) {
                (updated as any)[key] = contentMap[key];
              }
            }
            return updated;
          });
        }
      } catch (error) {
        console.error('Error fetching content settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, isLoading };
};
