-- Whether the participant sleeps on camp (needs a dorm bed) vs. a day /
-- commuter participant. Defaults to staying; day participants are flagged
-- from the registration form's "Confirmed" column ("Non camp participant").
ALTER TABLE participants ADD COLUMN staying_on_camp INTEGER NOT NULL DEFAULT 1;

-- bb26 day (non-camp) participants — they attend but do not need a dorm bed.
UPDATE participants
   SET staying_on_camp = 0,
       updated_at = datetime('now')
 WHERE edition = 'bb26'
   AND participant_code IN (
     'BB26-014',  -- Esther Olaoye
     'BB26-027',  -- Farida Khaleqi
     'BB26-028',  -- Razia Zadran
     'BB26-029'   -- Oluwapelumi Olaoye
   );
