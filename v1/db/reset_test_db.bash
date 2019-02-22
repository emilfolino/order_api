$(> v1/db/test.sqlite)
cat v1/db/migrate.sql | sqlite3 v1/db/test.sqlite
cat v1/db/status_seed.sql | sqlite3 v1/db/test.sqlite
