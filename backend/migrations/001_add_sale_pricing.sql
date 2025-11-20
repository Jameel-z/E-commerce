-- Migration: Add sale pricing fields to products table
-- Date: 2025-01-XX
-- Description: Adds regular_price and sale_price columns to support discount pricing

-- Add regular_price column (nullable to allow gradual migration)
ALTER TABLE products ADD COLUMN IF NOT EXISTS regular_price NUMERIC(10, 2);

-- Add sale_price column (nullable, only set when product is on sale)
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10, 2);

-- Add check constraint: sale_price must be less than regular_price when both are set
ALTER TABLE products ADD CONSTRAINT check_sale_price_less_than_regular 
    CHECK (sale_price IS NULL OR regular_price IS NULL OR sale_price < regular_price);

-- Optional: Migrate existing data (set regular_price = price for all existing products)
-- UPDATE products SET regular_price = price WHERE regular_price IS NULL;

-- Rollback SQL (commented out, run manually if needed):
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS check_sale_price_less_than_regular;
-- ALTER TABLE products DROP COLUMN IF EXISTS sale_price;
-- ALTER TABLE products DROP COLUMN IF EXISTS regular_price;
