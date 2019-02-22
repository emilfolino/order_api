$(> v2/db/test.sqlite)
cat v2/db/migrate.sql | sqlite3 v2/db/test.sqlite
cat v2/db/status_seed.sql | sqlite3 v2/db/test.sqlite
