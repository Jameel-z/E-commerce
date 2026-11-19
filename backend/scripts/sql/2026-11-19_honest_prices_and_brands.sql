-- One-off data fix for the Google Merchant Center Misrepresentation review (2026-11-19).
--
-- 1. Removes crossed-out "regular" prices that were never actually charged.
--    The price customers pay (products.price) does NOT change.
-- 2. Fills in missing brands from the product name, and fixes the "Lebovo" typo.
--
-- A backup of every touched column is saved first in products_backup_20261119.
-- To undo:
--   UPDATE products p SET regular_price = b.regular_price, sale_price = b.sale_price, brand = b.brand
--   FROM products_backup_20261119 b WHERE p.id = b.id;

BEGIN;

CREATE TABLE IF NOT EXISTS products_backup_20261119 AS
SELECT id, price, regular_price, sale_price, brand, condition FROM products;

-- 1. Fake discounts: keep the price customers pay, drop the strikethrough.
UPDATE products
SET regular_price = price,
    sale_price = NULL
WHERE sale_price IS NOT NULL;

-- 2. Brands (only products that currently have no brand).
UPDATE products SET brand = 'UGREEN'
WHERE brand IS NULL AND id IN (15,16,17,18,19,20,21,31,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,64,65,66,67,68,69,70,71,72,73);
UPDATE products SET brand = 'Dahua'
WHERE brand IS NULL AND id IN (80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102);
UPDATE products SET brand = 'Lenovo' WHERE brand IS NULL AND id IN (61,63,74,75,76,77,153);
UPDATE products SET brand = 'Dell'   WHERE brand IS NULL AND id IN (59,60,62);
UPDATE products SET brand = 'HP'     WHERE brand IS NULL AND id = 36;
UPDATE products SET brand = 'Imou'   WHERE brand IS NULL AND id = 30;
UPDATE products SET brand = 'CanvasArtisan' WHERE brand IS NULL AND id IN (78,79);
UPDATE products SET brand = 'Haixun' WHERE brand IS NULL AND id = 140;
UPDATE products SET brand = 'GTC'    WHERE brand IS NULL AND id = 150;
UPDATE products SET brand = 'Fantech' WHERE brand IS NULL AND id IN (151,152);

-- Typos / inconsistent casing.
UPDATE products SET brand = 'Lenovo' WHERE brand = 'Lebovo';
UPDATE products SET brand = 'UGREEN' WHERE lower(brand) = 'ugreen' AND brand <> 'UGREEN';
UPDATE products SET brand = 'Imou'   WHERE lower(brand) = 'imou' AND brand <> 'Imou';

-- Checks: all three numbers should look right before COMMIT.
SELECT count(*) AS still_on_sale FROM products WHERE sale_price IS NOT NULL;           -- expect 0
SELECT count(*) AS price_changed FROM products p JOIN products_backup_20261119 b USING (id)
WHERE p.price <> b.price;                                                              -- expect 0
SELECT coalesce(brand, '(none)') AS brand, count(*) FROM products GROUP BY 1 ORDER BY 2 DESC;

COMMIT;
