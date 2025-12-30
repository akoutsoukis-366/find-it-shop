import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string;
  colors: string[];
  in_stock: boolean;
  featured: boolean;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

// Convert DB product to cart-compatible product format
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  colors: string[];
  inStock: boolean;
  featured?: boolean;
  rating: number;
  reviews: number;
}

export const dbProductToProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description || '',
  price: Number(dbProduct.price),
  originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
  image: dbProduct.image_url || '',
  category: dbProduct.category,
  colors: dbProduct.colors || [],
  inStock: dbProduct.in_stock,
  featured: dbProduct.featured,
  rating: Number(dbProduct.rating),
  reviews: dbProduct.reviews_count,
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedProducts = (data || []).map(dbProductToProduct);
        setProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, isLoading, error };
};

export const useProduct = (id: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProduct(dbProductToProduct(data));
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, isLoading, error };
};

export const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'premium', name: 'Premium' },
  { id: 'essential', name: 'Essential' },
  { id: 'lifestyle', name: 'Lifestyle' },
  { id: 'bundle', name: 'Bundles' },
];
