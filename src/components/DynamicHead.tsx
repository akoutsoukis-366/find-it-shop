import { useEffect } from 'react';
import { useContentSettings } from '@/hooks/useContentSettings';

const DynamicHead = () => {
  const { content } = useContentSettings();

  useEffect(() => {
    if (content.store_name) {
      document.title = content.store_name;
    }

    if (content.logo_url) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = content.logo_url;
      link.type = 'image/png';
    }
  }, [content.store_name, content.logo_url]);

  return null;
};

export default DynamicHead;
