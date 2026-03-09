-- Ürün Soruları Tablosu
CREATE TABLE IF NOT EXISTS product_questions (
    question_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    is_answered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performans için indeksler
CREATE INDEX IF NOT EXISTS idx_questions_product ON product_questions(product_id);
CREATE INDEX IF NOT EXISTS idx_questions_user ON product_questions(user_id);
