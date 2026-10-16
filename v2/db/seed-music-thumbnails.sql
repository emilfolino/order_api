-- Run after seed-music.sql (and on an existing database after the migration).
-- Thumbnails live in public/img/thumbs/<name>.jpg next to the originals.
UPDATE products
SET thumbnail_url = replace(replace(image_url, '/img/', '/img/thumbs/'), '.png', '.jpg')
WHERE image_url LIKE '%/public/img/%.png';
