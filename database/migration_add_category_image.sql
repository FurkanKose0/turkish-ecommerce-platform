-- Add image_url column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Update existing categories with sample images (optional, based on your preference)
-- You can run specific UPDATE statements here if you have image URLs
