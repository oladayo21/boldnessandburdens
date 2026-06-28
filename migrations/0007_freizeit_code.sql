-- Give the Freizeit Haus overflow accommodation its own code, FZHaus-001.
UPDATE participants SET room_number = 'FZHaus-001', updated_at = datetime('now')
 WHERE edition = 'bb26' AND room_number = 'Freizeit Haus';
