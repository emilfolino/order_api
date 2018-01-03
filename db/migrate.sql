CREATE TABLE IF NOT EXISTS apikeys (
    key VARCHAR(32) PRIMARY KEY NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    productId INTEGER,
    articleNumber VARCHAR(32) NOT NULL,
    productName VARCHAR(255) NOT NULL,
    productDescription TEXT,
    productSpecifiers TEXT,
    apiKey VARCHAR(32) NOT NULL,
    FOREIGN KEY(apiKey) REFERENCES apikeys(key),
    UNIQUE(productId, apiKey)
);
