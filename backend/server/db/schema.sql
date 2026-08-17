CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product TEXT NOT NULL,
  audience TEXT NOT NULL,
  budget REAL NOT NULL CHECK (budget > 0),
  ai_output TEXT NOT NULL,
  logic_output TEXT NOT NULL,
  created_at TEXT NOT NULL
);