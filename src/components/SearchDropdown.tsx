import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';
import { Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
}

interface SearchDropdownProps {
  query: string;
  onSelect: () => void;
}

const SearchDropdown = ({ query, onSelect }: SearchDropdownProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formatPrice } = useCurrency();
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, image_url, category')
        .ilike('name', `%${query.trim()}%`)
        .limit(6);

      setResults(data || []);
      setIsLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (query.trim().length < 2) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <div className="px-4 py-6 text-sm text-muted-foreground text-center">
          Δεν βρέθηκαν προϊόντα
        </div>
      ) : (
        <div className="py-1">
          {results.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              onClick={onSelect}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
