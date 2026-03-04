-- Add colors and seasons columns to wardrobe_items
ALTER TABLE wardrobe_items 
ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS seasons TEXT[] DEFAULT '{}';

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON wardrobe_items;
CREATE POLICY "Users can insert their own wardrobe items" ON wardrobe_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wardrobe items" ON wardrobe_items;
CREATE POLICY "Users can update their own wardrobe items" ON wardrobe_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own wardrobe items" ON wardrobe_items;
CREATE POLICY "Users can delete their own wardrobe items" ON wardrobe_items
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own wardrobe items" ON wardrobe_items;
CREATE POLICY "Users can view their own wardrobe items" ON wardrobe_items
  FOR SELECT USING (auth.uid() = user_id OR is_template = true);
