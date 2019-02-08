INSERT INTO apikeys (email, key) VALUES ("unknown@example.com", "fdc42b2d941e8c6f7b38d974df3758ce");

INSERT INTO products (articleNumber, productName, productDescription, productSpecifiers, stock, location, price, apiKey) VALUES ("1214-RNT", "Skruv M14", "Skruv M14, värmförsinkad", '{"length" : "60mm", "width" : "14mm"}', 12, "A1B4", 1000, "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO products (articleNumber, productName, productDescription, productSpecifiers, stock, location, price, apiKey) VALUES ("1212-RNT", "Skruv M12", "Skruv M12, värmförsinkad", '{"length" : "60mm", "width" : "12mm"}', 14, "A1B5", 1000, "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO products (articleNumber, productName, productDescription, productSpecifiers, stock, location, price, apiKey) VALUES ("1210-RNT", "Skruv M10", "Skruv M10, värmförsinkad", '{"length" : "60mm", "width" : "10mm"}', 20, "A1B6", 1000, "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO products (articleNumber, productName, productDescription, productSpecifiers, stock, location, price, apiKey) VALUES ("1208-RNT", "Skruv M8", "Skruv M8, värmförsinkad", '{"length" : "60mm", "width" : "8mm"}', 2, "A1B7", 1000, "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO products (articleNumber, productName, productDescription, productSpecifiers, stock, location, price, apiKey) VALUES ("1206-RNT", "Skruv M6", "Skruv M6, värmförsinkad", '{"length" : "60mm", "width" : "6mm"}', 6, "A1B8", 1000, "fdc42b2d941e8c6f7b38d974df3758ce");

INSERT INTO products (articleNumber, productName, productDescription, productSpecifiers, stock, location, price, apiKey) VALUES ("1214-TNT", "Mutter M14", "Mutter M14, värmförsinkad, passar 1214-RNT", '{"diameter" : "14mm"}', 13, "A1C4", 1000, "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO products (articleNumber, productName, productDescription, productSpecifiers, stock, location, price, apiKey) VALUES ("1212-TNT", "Mutter M12", "Mutter M12, värmförsinkad, passar 1212-RNT", '{"diameter" : "12mm"}', 23, "A1C4", 1000, "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO products (articleNumber, productName, productDescription, productSpecifiers, stock, location, price, apiKey) VALUES ("1210-TNT", "Mutter M10", "Mutter M10, värmförsinkad, passar 1210-RNT", '{"diameter" : "10mm"}', 12, "A1C4", 1000, "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO products (articleNumber, productName, productDescription, productSpecifiers, stock, location, price, apiKey) VALUES ("1208-TNT", "Mutter M8", "Mutter M8, värmförsinkad, passar 1208-RNT", '{"diameter" : "8mm"}', 4, "A1C4", 1000, "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO products (articleNumber, productName, productDescription, productSpecifiers, stock, location, price, apiKey) VALUES ("1206-TNT", "Mutter M6", "Mutter M6, värmförsinkad, passar 1206-RNT", '{"diameter" : "6mm"}', 1, "A1C4", 1000, "fdc42b2d941e8c6f7b38d974df3758ce");

INSERT INTO orders (orderId, customerName, customerAddress, customerZip, customerCity, customerCountry, apiKey) VALUES (1, "Anders Andersson", "Andersgatan 1", "12345", "Anderstorp", "Sweden", "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO order_items (orderId, productId, amount, apiKey) VALUES (1, 1, 2, "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO order_items (orderId, productId, amount, apiKey) VALUES (1, 2, 3, "fdc42b2d941e8c6f7b38d974df3758ce");

INSERT INTO orders (orderId, customerName, customerAddress, customerZip, customerCity, customerCountry, apiKey) VALUES (2, "Bengt Bengtsson", "Bengtsgatan 2", "23457", "Bengtfors", "Sweden", "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO order_items (orderId, productId, amount, apiKey) VALUES (2, 3, 4, "fdc42b2d941e8c6f7b38d974df3758ce");

INSERT INTO orders (orderId, customerName, customerAddress, customerZip, customerCity, customerCountry, apiKey) VALUES (3, "Carl Carlsson", "Carlsgatan 3", "34567", "Karlstad", "Sweden", "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO order_items (orderId, productId, amount, apiKey) VALUES (3, 6, 5, "fdc42b2d941e8c6f7b38d974df3758ce");

INSERT INTO orders (orderId, customerName, customerAddress, customerZip, customerCity, customerCountry, apiKey) VALUES (4, "David Davidsson", "Davidsallén 4", "45678", "Davidstorp", "Sweden", "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO order_items (orderId, productId, amount, apiKey) VALUES (4, 8, 6, "fdc42b2d941e8c6f7b38d974df3758ce");
