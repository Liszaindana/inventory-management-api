# Inventory Management API

NestJS, TypeORM, PostgreSQL.

## Menjalankan

1. Salin .env.example menjadi .env, lalu sesuaikan konfigurasi database.
2. Jalankan PostgreSQL dengan: docker compose up -d.
3. Instal dependency dengan: npm install.
4. Jalankan API dengan: npm run start:dev.

API berjalan di http://localhost:3000. Saat NODE_ENV=development, schema disinkronkan oleh TypeORM. Untuk production, gunakan migration dan matikan synchronize.

Rancangan endpoint dan tabel ada di ../API_SPEC.md.
