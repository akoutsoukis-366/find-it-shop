import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCategories, type Category } from '@/hooks/useCategories';
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

const AdminCategories = () => {
  const { categories, isLoading, refetch } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    setEditingCategory({ name: '', slug: '', sort_order: categories.length + 1 });
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory({ ...category });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingCategory?.name || !editingCategory?.slug) {
      toast.error('Name and slug are required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory.id) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: editingCategory.name,
            slug: editingCategory.slug,
            sort_order: editingCategory.sort_order ?? 0,
          })
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast.success('Category updated');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            name: editingCategory.name,
            slug: editingCategory.slug,
            sort_order: editingCategory.sort_order ?? 0,
          });
        if (error) throw error;
        toast.success('Category created');
      }
      setDialogOpen(false);
      setEditingCategory(null);
      refetch();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const category = deleteDialog.category;
    if (!category) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);
      if (error) throw error;
      toast.success('Category deleted');
      refetch();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setDeleteDialog({ open: false, category: null });
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

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
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Manage product categories ({categories.length} total)</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Order</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Slug</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  No categories found. Add one to get started.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-foreground">{category.sort_order}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{category.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{category.slug}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteDialog({ open: true, category })}
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
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory?.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name *</Label>
                <Input
                  id="cat-name"
                  value={editingCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingCategory({
                      ...editingCategory,
                      name,
                      slug: editingCategory.id ? editingCategory.slug : generateSlug(name),
                    });
                  }}
                  placeholder="Category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug *</Label>
                <Input
                  id="cat-slug"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="category-slug"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-order">Sort Order</Label>
                <Input
                  id="cat-order"
                  type="number"
                  value={editingCategory.sort_order ?? 0}
                  onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingCategory.id ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, category: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.category?.name}"? Products in this category won't be deleted but will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategories;
