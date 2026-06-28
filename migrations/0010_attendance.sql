-- Per-day attendance. One row per participant per conference day they attend.
-- Presence is the existence of the row; checked_in_at records when it was marked.
-- This supersedes the single participants.checked_in flag (now dormant).
CREATE TABLE IF NOT EXISTS attendance (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  edition          TEXT NOT NULL,
  participant_code TEXT NOT NULL,
  day              TEXT NOT NULL,            -- conference day, 'YYYY-MM-DD'
  checked_in_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (edition, participant_code, day)
);

CREATE INDEX IF NOT EXISTS idx_attendance_day
  ON attendance (edition, day);
