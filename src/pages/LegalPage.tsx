import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface LegalPageProps {
  titleKey: string;
  contentKey: string;
}

const LegalPage = ({ titleKey, contentKey }: LegalPageProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [titleKey, contentKey]);

      if (data) {
        data.forEach((item) => {
          if (item.key === titleKey) setTitle(item.value || '');
          if (item.key === contentKey) setContent(item.value || '');
        });
      }
      setIsLoading(false);
    };
    fetch();
  }, [titleKey, contentKey]);

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3 key={i} className="text-lg font-semibold text-foreground mt-6 mb-2">
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="text-muted-foreground ml-4 list-disc">
            {line.substring(2)}
          </li>
        );
      }
      if (line.trim() === '') return <br key={i} />;
      return (
        <p key={i} className="text-muted-foreground mb-2">
          {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="text-foreground font-semibold">{part.replace(/\*\*/g, '')}</strong>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">{title}</h1>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {renderContent(content)}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const PrivacyPolicy = () => <LegalPage titleKey="privacy_title" contentKey="privacy_content" />;
export const Terms = () => <LegalPage titleKey="terms_title" contentKey="terms_content" />;
export const Shipping = () => <LegalPage titleKey="shipping_title" contentKey="shipping_content" />;
