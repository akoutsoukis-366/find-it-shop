import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContentSettings {
  // Store info
  store_name: string;
  // Images & Videos
  hero_image_url: string;
  hero_video_url: string;
  logo_url: string;
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
  // Store info
  store_name: '',
  // Images & Videos
  hero_image_url: '',
  hero_video_url: '',
  logo_url: '',
  // Hero section
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
  // Features section
  features_title: '',
  features_subtitle: '',
  feature1_title: '',
  feature1_description: '',
  feature2_title: '',
  feature2_description: '',
  feature3_title: '',
  feature3_description: '',
  // Featured products section
  featured_products_title: '',
  featured_products_subtitle: '',
  // CTA section
  cta_title_line1: '',
  cta_title_line2: '',
  cta_description: '',
  cta_button_text: '',
  // About page hero
  about_hero_title_line1: '',
  about_hero_title_line2: '',
  about_hero_description: '',
  // About page stats
  about_stat1_value: '',
  about_stat1_label: '',
  about_stat2_value: '',
  about_stat2_label: '',
  about_stat3_value: '',
  about_stat3_label: '',
  about_stat4_value: '',
  about_stat4_label: '',
  // About page story
  about_story_title: '',
  about_story_paragraph1: '',
  about_story_paragraph2: '',
  about_story_paragraph3: '',
  about_story_box_title: '',
  about_story_box_subtitle: '',
  // About page values
  about_values_title: '',
  about_values_subtitle: '',
  about_value1_title: '',
  about_value1_description: '',
  about_value2_title: '',
  about_value2_description: '',
  about_value3_title: '',
  about_value3_description: '',
  // About page contact section
  about_contact_title: '',
  about_contact_subtitle: '',
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
