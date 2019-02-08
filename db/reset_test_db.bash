$(> db/test.sqlite)
cat db/migrate.sql | sqlite3 db/test.sqlite
cat db/drop_column_product_id.sql | sqlite3 db/test.sqlite
cat db/status_seed.sql | sqlite3 db/test.sqlite
