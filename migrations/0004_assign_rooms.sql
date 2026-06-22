-- Finalised room allocation (the /bb26/proposal plan).
-- Babies share their mum's room; the four day participants keep
-- room_number NULL (they do not need a bed).

UPDATE participants SET room_number = '1', updated_at = datetime('now')
 WHERE edition = 'bb26' AND participant_code IN
   ('BB26-040','BB26-041','BB26-042','BB26-043','BB26-018','BB26-020');

UPDATE participants SET room_number = '2', updated_at = datetime('now')
 WHERE edition = 'bb26' AND participant_code IN
   ('BB26-033','BB26-034','BB26-022','BB26-025','BB26-026','BB26-037','BB26-035');

UPDATE participants SET room_number = '3', updated_at = datetime('now')
 WHERE edition = 'bb26' AND participant_code IN
   ('BB26-007','BB26-016','BB26-015','BB26-044','BB26-030','BB26-009','BB26-017');

UPDATE participants SET room_number = '4', updated_at = datetime('now')
 WHERE edition = 'bb26' AND participant_code IN
   ('BB26-003','BB26-023','BB26-024','BB26-008','BB26-010','BB26-011','BB26-046','BB26-047');

UPDATE participants SET room_number = '5', updated_at = datetime('now')
 WHERE edition = 'bb26' AND participant_code IN
   ('BB26-045','BB26-031','BB26-038');

UPDATE participants SET room_number = '6', updated_at = datetime('now')
 WHERE edition = 'bb26' AND participant_code IN
   ('BB26-013','BB26-019','BB26-032','BB26-036','BB26-002','BB26-006');

UPDATE participants SET room_number = 'Freizeit Haus', updated_at = datetime('now')
 WHERE edition = 'bb26' AND participant_code IN
   ('BB26-001','BB26-004','BB26-005','BB26-012','BB26-039');
