CREATE TABLE IF NOT EXISTS anchor_ledger (
    internal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id TEXT UNIQUE NOT NULL,
    timestamp TEXT NOT NULL,
    project_name TEXT NOT NULL,
    is_compliant INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    chain_hash TEXT UNIQUE NOT NULL,
    payload TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anchor_ledger_project ON anchor_ledger(project_name);
CREATE INDEX IF NOT EXISTS idx_anchor_ledger_timestamp ON anchor_ledger(timestamp DESC);