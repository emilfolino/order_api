$(> v2/db/test.sqlite)
cat v2/db/migrate.sql | sqlite3 v2/db/test.sqlite
cat v2/db/add_image_url_to_orders.sql | sqlite3 v2/db/test.sqlite
cat v2/db/status_seed.sql | sqlite3 v2/db/test.sqlite
