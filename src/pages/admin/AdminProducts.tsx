import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';
import MediaGalleryUpload from '@/components/admin/MediaGalleryUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
interface ProductSpec {
  label: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  media_urls: string[];
  category: string;
  colors: string[];
  in_stock: boolean;
  featured: boolean;
  rating: number;
  reviews_count: number;
  specs: ProductSpec[];
  created_at: string;
  updated_at: string;
}

const parseSpecs = (specs: unknown): ProductSpec[] => {
  if (!specs || !Array.isArray(specs)) return [];
  return specs.filter(
    (spec): spec is ProductSpec =>
      typeof spec === 'object' &&
      spec !== null &&
      typeof spec.label === 'string' &&
      typeof spec.value === 'string'
  );
};

const defaultProduct: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  description: '',
  price: 0,
  original_price: null,
  image_url: '',
  media_urls: [],
  category: 'essential',
  colors: [],
  in_stock: true,
  featured: false,
  rating: 0,
  reviews_count: 0,
  specs: [],
};

const getProductImage = (imageUrl: string | null): string => {
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return imageUrl;
  }
  return '/placeholder.svg';
};

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transform specs from unknown JSON to ProductSpec[]
      const transformedProducts = (data || []).map(product => ({
        ...product,
        specs: parseSpecs(product.specs),
        media_urls: product.media_urls || [],
      }));
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct({ ...defaultProduct });
    setDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || !editingProduct.price) {
      toast.error('Name and price are required');
      return;
    }

    // Filter out empty specs
    const validSpecs = (editingProduct.specs || []).filter(
      spec => spec.label.trim() && spec.value.trim()
    );

    setIsSaving(true);
    try {
      if (editingProduct.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            original_price: editingProduct.original_price || null,
            image_url: editingProduct.image_url,
            media_urls: editingProduct.media_urls || [],
            category: editingProduct.category,
            colors: editingProduct.colors || [],
            in_stock: editingProduct.in_stock,
            featured: editingProduct.featured,
            specs: validSpecs as unknown as Json,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            original_price: editingProduct.original_price || null,
            image_url: editingProduct.image_url,
            media_urls: editingProduct.media_urls || [],
            category: editingProduct.category || 'essential',
            colors: editingProduct.colors || [],
            in_stock: editingProduct.in_stock ?? true,
            featured: editingProduct.featured ?? false,
            specs: validSpecs as unknown as Json,
          });

        if (error) throw error;
        toast.success('Product created');
      }

      setDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    const product = deleteDialog.product;
    if (!product) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast.success('Product deleted');
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteDialog({ open: false, product: null });
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog ({products.length} total)</p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Rating</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {searchQuery ? 'No products match your search' : 'No products found'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                          <img
                            src={getProductImage(product.image_url)}
                            alt={product.name}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.reviews_count} reviews</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">${Number(product.price).toFixed(2)}</div>
                      {product.original_price && (
                        <div className="text-sm text-muted-foreground line-through">${Number(product.original_price).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.in_stock ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                      }`}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground">{product.rating}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteDialog({ open: true, product })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Product Edit/Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct?.id ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Product description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.original_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, original_price: parseFloat(e.target.value) || null })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editingProduct.category || 'essential'}
                  onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="essential">Essential</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ImageUpload
                value={editingProduct.image_url || ''}
                onChange={(url) => setEditingProduct({ ...editingProduct, image_url: url })}
                label="Main Product Image"
                description="Primary image shown in listings"
                folder="products"
              />

              <MediaGalleryUpload
                value={editingProduct.media_urls || []}
                onChange={(urls) => setEditingProduct({ ...editingProduct, media_urls: urls })}
                label="Additional Media"
                description="Add more images and videos for the product gallery"
                folder="products"
              />

              <div className="flex items-center justify-between">
                <Label htmlFor="in_stock">In Stock</Label>
                <Switch
                  id="in_stock"
                  checked={editingProduct.in_stock ?? true}
                  onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, in_stock: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={editingProduct.featured ?? false}
                  onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, featured: checked })}
                />
              </div>

              {/* Specifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Specifications</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentSpecs = editingProduct.specs || [];
                      setEditingProduct({
                        ...editingProduct,
                        specs: [...currentSpecs, { label: '', value: '' }],
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Spec
                  </Button>
                </div>
                {(editingProduct.specs || []).map((spec, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Label (e.g., Battery)"
                      value={spec.label}
                      onChange={(e) => {
                        const newSpecs = [...(editingProduct.specs || [])];
                        newSpecs[index] = { ...newSpecs[index], label: e.target.value };
                        setEditingProduct({ ...editingProduct, specs: newSpecs });
                      }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value (e.g., 1 year)"
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...(editingProduct.specs || [])];
                        newSpecs[index] = { ...newSpecs[index], value: e.target.value };
                        setEditingProduct({ ...editingProduct, specs: newSpecs });
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => {
                        const newSpecs = (editingProduct.specs || []).filter((_, i) => i !== index);
                        setEditingProduct({ ...editingProduct, specs: newSpecs });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Product'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: open ? deleteDialog.product : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.product?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
