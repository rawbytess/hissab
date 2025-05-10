CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')),
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    history TEXT,
    line_number INTEGER,
    results TEXT,
    final_answer TEXT
);

-- Optional: You might want to create indexes for columns that are frequently queried.
-- For example, if you often search by 'model' or 'created_at':
-- CREATE INDEX IF NOT EXISTS idx_interactions_model ON interactions (model);
-- CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions (created_at);

-- Example of how to insert data (for testing purposes):
/*
INSERT INTO interactions (model, prompt, history, line_number, results, final_answer) VALUES
('text-davinci-003', 'What is the capital of France?', NULL, NULL, '{"answer": "Paris"}', 'Paris'),
('code-cushman-001', 'Write a python function to add two numbers', '[{"role": "user", "content": "add 2 numbers"}]', 5, '{"code": "def add(a, b): return a + b"}', 'def add(a, b): return a + b');
*/

-- Example of how to select data (for testing purposes):
-- SELECT * FROM interactions;
