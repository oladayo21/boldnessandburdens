-- Boldness & Burdens conference participants.
-- One row per person (families share emails, so email is NOT unique).
-- `edition` namespaces each year's cohort so the same DB serves bb26, bb27, ...

CREATE TABLE IF NOT EXISTS participants (
  id                        INTEGER PRIMARY KEY AUTOINCREMENT,
  edition                   TEXT    NOT NULL DEFAULT 'bb26',
  participant_code          TEXT    NOT NULL,            -- human ID, e.g. BB26-001

  full_name                 TEXT    NOT NULL,
  email                     TEXT,
  phone                     TEXT,
  gender                    TEXT,
  city                      TEXT,

  wants_tshirt              TEXT,
  tshirt_size               TEXT,

  has_medical_conditions    TEXT,
  medical_conditions        TEXT,
  has_allergies             TEXT,
  allergies                 TEXT,

  emergency_contact_name    TEXT,
  emergency_contact_phone   TEXT,

  photo_consent             TEXT,
  participation_consent     TEXT,
  consent_date              TEXT,

  -- Assigned later via the admin UI (nullable until set).
  room_number               TEXT,
  group_name                TEXT,
  eating_group              TEXT,
  checked_in                INTEGER NOT NULL DEFAULT 0,

  created_at                TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at                TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- One code per edition.
CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_edition_code
  ON participants (edition, participant_code);

-- Case-insensitive name search for the typeahead lookup.
CREATE INDEX IF NOT EXISTS idx_participants_name
  ON participants (edition, full_name COLLATE NOCASE);
