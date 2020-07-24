$(> test.sqlite)
cat migrate.sql | sqlite3 test.sqlite
cat status_seed.sql | sqlite3 test.sqlite
