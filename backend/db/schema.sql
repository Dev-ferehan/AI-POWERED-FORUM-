CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, 
    filename VARCHAR(255) NOT NULL, 
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'READY', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE document_chunks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);