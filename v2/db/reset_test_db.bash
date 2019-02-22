$(> db/test.sqlite)
cat db/migrate_v2.sql | sqlite3 db/test.sqlite
cat db/status_seed.sql | sqlite3 db/test.sqlite
