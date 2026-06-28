-- Room reassignment (2026-06-26): gather the two Room 4 mums-with-babies into
-- the quieter Room 5, and backfill their vacated Room 4 beds with the three
-- former Room 5 singles. The Sorunke mum (Room 3) and Neumann mum (Room 2)
-- stay put. Babies always follow their mum.

-- Famuyiwa (Eniola Taiwo + baby Gabrielle) and Fagbemi (Olawumi + baby Lois)
-- move from Room 4 to Room 5.
UPDATE participants SET room_number = '5', updated_at = datetime('now')
 WHERE edition = 'bb26' AND participant_code IN
   ('BB26-023','BB26-047','BB26-003','BB26-046');

-- Alice Reinwarth, Miriam Wobieri, Phoebe Adenmosun move from Room 5 to Room 4.
UPDATE participants SET room_number = '4', updated_at = datetime('now')
 WHERE edition = 'bb26' AND participant_code IN
   ('BB26-038','BB26-031','BB26-045');
