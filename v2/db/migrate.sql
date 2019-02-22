CREATE TABLE IF NOT EXISTS apikeys (
    key VARCHAR(32) PRIMARY KEY NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    productId INTEGER NOT NULL,
    articleNumber VARCHAR(32),
    productName VARCHAR(255) NOT NULL,
    productDescription TEXT,
    productSpecifiers TEXT,
    stock INTEGER,
    location VARCHAR(255),
    price INTEGER,
    apiKey VARCHAR(32) NOT NULL,
    FOREIGN KEY(apiKey) REFERENCES apikeys(key),
    UNIQUE(productId, apiKey)
);

CREATE TABLE IF NOT EXISTS status (
    id INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL,
    UNIQUE(id)
);

CREATE TABLE IF NOT EXISTS orders (
    orderId INTEGER NOT NULL,
    customerName VARCHAR(255) NOT NULL,
    customerAddress VARCHAR(255),
    customerZip VARCHAR(12),
    customerCity VARCHAR(255),
    customerCountry VARCHAR(255),
    statusId INTEGER NOT NULL DEFAULT 100,
    apiKey VARCHAR(32) NOT NULL,
    FOREIGN KEY(apiKey) REFERENCES apikeys(key),
    FOREIGN KEY(statusId) REFERENCES status(id),
    UNIQUE(orderId, apiKey)
);

CREATE TABLE IF NOT EXISTS order_items (
    orderId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    apiKey VARCHAR(32) NOT NULL,
    FOREIGN KEY(apiKey) REFERENCES apikeys(key),
    FOREIGN KEY(orderId) REFERENCES orders(orderId),
    FOREIGN KEY(productId) REFERENCES products(productId),
    UNIQUE(orderId, productId, apiKey)
);

CREATE TABLE IF NOT EXISTS deliveries (
    deliveryId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    deliveryDate TEXT NOT NULL,
    comment TEXT,
    apiKey VARCHAR(32) NOT NULL,
    FOREIGN KEY(apiKey) REFERENCES apikeys(key),
    UNIQUE(deliveryId, apiKey)
);

CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(255) NOT NULL,
    password VARCHAR(60) NOT NULL,
    apiKey VARCHAR(32) NOT NULL,
    FOREIGN KEY(apiKey) REFERENCES apikeys(key),
    UNIQUE(email, apiKey)
);

CREATE TABLE IF NOT EXISTS invoices (
    invoiceId INTEGER NOT NULL,
    orderId INTEGER NOT NULL,
    totalPrice INTEGER NOT NULL DEFAULT 0,
    apiKey VARCHAR(32) NOT NULL,
    FOREIGN KEY(apiKey) REFERENCES apikeys(key),
    FOREIGN KEY(orderId) REFERENCES orders(orderId),
    UNIQUE(invoiceId, apiKey)
);
