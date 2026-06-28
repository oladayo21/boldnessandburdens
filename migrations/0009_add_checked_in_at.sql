-- Track when each participant checked in (arrivals are staggered across days).
-- NULL until they arrive; cleared if they are un-checked-in.
ALTER TABLE participants ADD COLUMN checked_in_at TEXT;

-- Backfill anyone already marked checked in but missing a timestamp.
UPDATE participants SET checked_in_at = datetime('now')
 WHERE checked_in = 1 AND checked_in_at IS NULL;
