# API Specification — Inventory Management API

## Informasi umum

- Base URL development: http://localhost:3001
- Format request dan response: JSON
- ID: UUID
- Nama field JSON: camelCase
- Waktu: ISO 8601
- Nest ValidationPipe aktif dengan whitelist dan forbidNonWhitelisted. Field yang tidak dikenal atau body tidak valid menghasilkan 400.
- Data produk dan transaksi stok menggunakan soft delete. Data master kategori, pemasok, dan gudang dihapus secara permanen.

## Endpoint

| Method | Path | Keterangan |
|---|---|---|
| GET | / | Pesan sambutan API |
| GET, POST | /categories | Daftar dan buat kategori |
| GET, PATCH, DELETE | /categories/:id | Detail, ubah, hapus kategori |
| GET, POST | /suppliers | Daftar dan buat pemasok |
| GET, PATCH, DELETE | /suppliers/:id | Detail, ubah, hapus pemasok |
| GET, POST | /warehouses | Daftar dan buat gudang |
| GET, PATCH, DELETE | /warehouses/:id | Detail, ubah, hapus gudang |
| GET, POST | /products | Daftar dan buat produk |
| GET, PATCH, DELETE | /products/:id | Detail, ubah, soft delete produk |
| GET | /products/:id/stock | Hitung stok produk berdasarkan transaksi |
| GET, POST | /stock-movements | Daftar dan buat transaksi stok |
| GET, PATCH, DELETE | /stock-movements/:id | Detail, ubah catatan/tanggal, void transaksi |
| GET | /stock-movement-items?movementId=UUID | Daftar item transaksi |
| GET | /stock-movement-items/:id | Detail item transaksi |

Daftar endpoint mengembalikan array biasa; pagination dan pencarian belum tersedia. Item transaksi dibuat sebagai bagian dari POST /stock-movements dan tidak mempunyai endpoint POST, PATCH, atau DELETE tersendiri.

## Request body

### Kategori

POST /categories

    {
      "name": "Elektronik",
      "description": "Perangkat elektronik"
    }

Nama wajib berupa string, maksimal 100 karakter. Deskripsi opsional.

### Pemasok

POST /suppliers

    {
      "name": "PT Sumber Makmur",
      "email": "sales@example.com",
      "phone": "0215551234",
      "address": "Jakarta"
    }

Nama wajib, maksimal 150 karakter. Email, telepon, dan alamat opsional. Email harus valid dan maksimal 150 karakter; telepon maksimal 20 karakter.

### Gudang

POST /warehouses

    {
      "code": "WH-JKT-01",
      "name": "Gudang Jakarta",
      "address": "Jl. Industri No. 10",
      "city": "Jakarta"
    }

Kode wajib, maksimal 20 karakter. Nama wajib, maksimal 150 karakter. Alamat dan kota opsional; kota maksimal 100 karakter.

### Produk

POST /products

    {
      "sku": "ELK-0001",
      "name": "Keyboard",
      "description": "Keyboard mekanik",
      "unit": "pcs",
      "price": 250000,
      "minStock": 5,
      "categoryId": "UUID_CATEGORY",
      "supplierId": "UUID_SUPPLIER"
    }

SKU wajib dan maksimal 50 karakter. Nama wajib dan maksimal 255 karakter. Satuan wajib dan maksimal 20 karakter. Deskripsi opsional. Harga opsional, minimal 0, maksimal 2 angka desimal. Stok minimum opsional, integer minimal 0. Category ID dan Supplier ID wajib berupa UUID.

### Transaksi stok

POST /stock-movements

    {
      "type": "IN",
      "warehouseId": "UUID_WAREHOUSE",
      "movementDate": "2026-11-06T10:00:00.000Z",
      "notes": "Stok masuk",
      "items": [
        {
          "productId": "UUID_PRODUCT",
          "quantity": 20
        }
      ]
    }

Tipe wajib IN atau OUT. Warehouse ID wajib UUID. Tanggal dan catatan opsional; tanggal memakai ISO 8601. Items wajib berisi minimal satu item. Product ID wajib UUID, quantity integer minimal 1, dan satu produk tidak boleh muncul dua kali pada transaksi yang sama. Reference number dibuat oleh server.

Pembuatan transaksi menyimpan header dan item melalui relasi cascade. Saat ini service belum memeriksa ketersediaan stok sebelum menerima transaksi OUT.

### Mengubah transaksi

PATCH /stock-movements/:id hanya menerima catatan dan/atau tanggal.

    {
      "notes": "Catatan diperbarui",
      "movementDate": "2026-11-06T11:00:00.000Z"
    }

Field lain seperti type, warehouseId, dan items ditolak oleh validasi global.

## Perhitungan stok

GET /products/:id/stock menghitung stok dari item transaksi yang masih aktif:

    stok = total quantity transaksi IN - total quantity transaksi OUT

Transaksi yang sudah di-void tidak ikut dihitung. Response berisi productId, SKU, nama, satuan, minStock, totalStock, isLowStock, dan daftar gudang beserta totalIn, totalOut, dan stock.

Contoh bentuk response:

    {
      "productId": "UUID_PRODUCT",
      "sku": "ELK-0001",
      "name": "Keyboard",
      "unit": "pcs",
      "minStock": 5,
      "totalStock": 20,
      "isLowStock": false,
      "warehouses": [
        {
          "warehouseId": "UUID_WAREHOUSE",
          "code": "WH-JKT-01",
          "name": "Gudang Jakarta",
          "totalIn": 20,
          "totalOut": 0,
          "stock": 20
        }
      ]
    }

## Struktur tabel dan relasi

Semua tabel utama memiliki id UUID, createdAt, dan updatedAt dari BaseEntity, kecuali bila disebut berbeda.

| Tabel | Kolom utama |
|---|---|
| categories | name varchar(100), unik; description text nullable |
| suppliers | name varchar(150); email varchar(150) nullable dan unik; phone varchar(20) nullable; address text nullable |
| warehouses | code varchar(20) unik; name varchar(150); address text nullable; city varchar(100) nullable |
| products | sku varchar(50) unik; name varchar(255); description text nullable; unit varchar(20); price decimal(12,2); minStock int; categoryId UUID; supplierId UUID; deletedAt nullable |
| stock_movements | referenceNumber varchar(50) unik; type varchar(10); warehouseId UUID; movementDate timestamp; notes text nullable; deletedAt nullable |
| stock_movement_items | movementId UUID; productId UUID; quantity int minimal 1; pasangan movementId dan productId unik |

Relasi:

- Satu kategori memiliki banyak produk; satu produk memiliki satu kategori.
- Satu pemasok memasok banyak produk; satu produk memiliki satu pemasok.
- Satu gudang memiliki banyak transaksi.
- Satu transaksi memiliki banyak item.
- Satu produk dapat tercatat di banyak item transaksi.
- Penghapusan kategori, pemasok, atau gudang yang masih direferensikan dibatasi foreign key RESTRICT.
- Item ikut terhapus secara permanen jika header transaksi dihapus permanen; endpoint DELETE transaksi saat ini melakukan soft delete, bukan penghapusan permanen.

## Status dan error

- 200: GET, PATCH, DELETE berhasil.
- 201: POST berhasil.
- 400: UUID tidak valid, validasi DTO gagal, atau field tambahan dikirim.
- 404: ID data tidak ditemukan.
- 500: error database lain yang belum dipetakan menjadi format API khusus, termasuk potensi konflik unique key atau foreign key.

Format error menggunakan format bawaan NestJS. Format dan status error database dapat berbeda sampai error handling khusus ditambahkan.

## Perubahan dari API Specification sebelumnya

1. Endpoint GET /stocks dihapus dari scope. Perhitungan stok dipindahkan ke GET /products/:id/stock.
2. Resource stock-movement-items sekarang memiliki folder dan module sendiri, dengan endpoint GET daftar dan GET detail. Pembuatan item tetap melalui POST /stock-movements.
3. Pagination, search, filter list, dan response data/meta dihapus. Endpoint list sekarang mengembalikan array langsung.
4. Validasi bisnis OUT yang menolak stok tidak cukup belum diimplementasikan pada service CRUD sederhana.
5. Pembuatan transaksi memakai cascade dari TypeORM; void mengubah deletedAt transaksi, dan stok menghitung transaksi aktif saja.
6. Error duplicate unique key dan pelanggaran foreign key belum diterjemahkan khusus ke 409.
7. CRUD master dan produk memakai service repository dasar agar sesuai pola NestJS yang sedang dipelajari.

