INSERT INTO apikeys (email, key) VALUES ("unknown@example.com", "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO apikeys (email, key) VALUES ("known@example.com", "1bdd5c943e664d399f2a298fca0dabfd");

INSERT INTO products (productId, articleNumber, productName, productDescription, productSpecifiers, stock, location, apiKey) VALUES (1, "1212-RNT", "Screw 14mm", "A mighty fine screw.", "{length : '14mm', width : '5mm'}", 12, "A1B4", "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO products (productId, articleNumber, productName, productDescription, productSpecifiers, stock, location, apiKey) VALUES (2, "1212-TNT", "Bolt 14mm", "A bolt that fits the mighty fine screw.", "{length : '5mm', width : '5mm'}", 15, "A1C4", "fdc42b2d941e8c6f7b38d974df3758ce");
INSERT INTO products (productId, articleNumber, productName, productDescription, productSpecifiers, stock, location, apiKey) VALUES (1, "QRT-LLL-14", "Blue yarn", "Nice quality yarn.", "{ color : 'blue', thickness : 8}", 2, "B14", "1bdd5c943e664d399f2a298fca0dabfd");
INSERT INTO products (productId, articleNumber, productName, productDescription, productSpecifiers, stock, location, apiKey) VALUES (3, "QRT-R34-14", "Red yarn", "Low qaulity yarn.", "{ color : 'red', thickness : 2}", 3, "C12", "1bdd5c943e664d399f2a298fca0dabfd");
