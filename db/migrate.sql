CREATE TABLE IF NOT EXISTS apikeys (
    keyId INTEGER PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    key VARCHAR(16) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    productId INTEGER,
    articleNumber VARCHAR(32) NOT NULL,
    productName VARCHAR(255) NOT NULL,
    productDescription TEXT,
    productSpecifiers TEXT,
    owner INTEGER NOT NULL,
    FOREIGN KEY(owner) REFERENCES apikeys(keyId),
    UNIQUE(productId, owner)
);
