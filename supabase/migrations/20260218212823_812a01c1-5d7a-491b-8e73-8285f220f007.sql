
-- Add stock_quantity column to products (default 0, nullable no)
ALTER TABLE public.products ADD COLUMN stock_quantity integer NOT NULL DEFAULT 0;

-- Create trigger function to auto-update in_stock based on stock_quantity
CREATE OR REPLACE FUNCTION public.update_in_stock_from_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock_quantity <= 0 THEN
    NEW.in_stock := false;
    NEW.stock_quantity := GREATEST(NEW.stock_quantity, 0);
  ELSE
    NEW.in_stock := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
CREATE TRIGGER sync_in_stock_with_quantity
BEFORE INSERT OR UPDATE OF stock_quantity ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_in_stock_from_quantity();
