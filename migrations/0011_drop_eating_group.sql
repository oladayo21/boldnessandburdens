-- The per-participant meal group was removed from the app. Drop the column.
-- IMPORTANT: apply this to remote D1 only AFTER the new worker code (which no
-- longer references eating_group) is deployed — the previously-deployed code
-- still SELECTs this column and would error if it vanished first.
ALTER TABLE participants DROP COLUMN eating_group;
