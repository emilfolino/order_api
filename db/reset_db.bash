$(> orders.sqlite)
cat migrate_v2.sql | sqlite3 orders.sqlite
cat status_seed.sql | sqlite3 orders.sqlite
cat seed_v2.sql | sqlite3 orders.sqlite
