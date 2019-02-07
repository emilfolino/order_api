UPDATE orders SET customerName="Nora Norrby", customerAddress="Norasgatan 3", customerZip="34567", customerCity="Nora", customerCountry="Sweden" WHERE ROWID=3;

UPDATE orders SET customerName="Ulla Ullman", customerAddress="Ullasallén 4", customerZip="45678", customerCity="Ullared", customerCountry="Sweden" WHERE ROWID=4;

BEGIN TRANSACTION;

CREATE TEMPORARY TABLE products_backup (
    articleNumber VARCHAR(32),
    productName VARCHAR(255) NOT NULL,
    productDescription TEXT,
    productSpecifiers TEXT,
    stock INTEGER,
    location VARCHAR(255),
    price INTEGER,
    apiKey VARCHAR(32) NOT NULL,
    FOREIGN KEY(apiKey) REFERENCES apikeys(key)
);

INSERT INTO products_backup
SELECT
    articleNumber,
    productName,
    productDescription,
    productSpecifiers,
    stock,
    location,
    price,
    apiKey
FROM products;

DROP TABLE products;

CREATE TABLE products (
    articleNumber VARCHAR(32),
    productName VARCHAR(255) NOT NULL,
    productDescription TEXT,
    productSpecifiers TEXT,
    stock INTEGER,
    location VARCHAR(255),
    price INTEGER,
    apiKey VARCHAR(32) NOT NULL,
    FOREIGN KEY(apiKey) REFERENCES apikeys(key)
);

INSERT INTO products SELECT * FROM products_backup;

DROP TABLE products_backup;

COMMIT;
