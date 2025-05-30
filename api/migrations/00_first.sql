CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%S', 'NOW')),
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    history TEXT,
    line_number INTEGER,
    results TEXT,
    final_answer TEXT
);
