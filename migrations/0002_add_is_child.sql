-- Flag participants who are young children (Age Band 0-3 on the organisers' sheet).
ALTER TABLE participants ADD COLUMN is_child INTEGER NOT NULL DEFAULT 0;
