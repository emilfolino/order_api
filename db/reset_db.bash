cat migrate.sql | sqlite3 orders.sqlite
cat status_seed.sql | sqlite3 orders.sqlite
cat seed.sql | sqlite3 orders.sqlite
cat updates.sql | sqlite3 orders.sqlite
