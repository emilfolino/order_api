$(> v2/db/orders.sqlite)
cat v2/db/migrate.sql | sqlite3 v2/db/orders.sqlite
cat v2/db/status_seed.sql | sqlite3 v2/db/orders.sqlite
cat v2/db/seed.sql | sqlite3 v2/db/orders.sqlite
