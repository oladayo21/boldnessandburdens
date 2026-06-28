-- Rename the six numbered rooms to dormitory codes (DORM-01 .. DORM-06).
-- Freizeit Haus keeps its building name; day participants stay NULL.
UPDATE participants SET room_number = 'DORM-0' || room_number, updated_at = datetime('now')
 WHERE edition = 'bb26' AND room_number IN ('1','2','3','4','5','6');
