-- Shorten the Freizeit Haus code: FZHaus-001 -> FZH-001.
UPDATE participants SET room_number = 'FZH-001', updated_at = datetime('now')
 WHERE edition = 'bb26' AND room_number = 'FZHaus-001';
