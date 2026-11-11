import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductsModule } from './products/products.module.js';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { WarehousesModule } from './warehouses/warehouses.module.js';

// Modul Categories, StockMovements, dan StockMovementItems belum ada di branch
// ini. Import-nya tidak disertakan agar aplikasi tetap bisa di-build. Modul
// tersebut dapat ditambahkan kembali saat branch pemiliknya sudah di-merge.

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>(
          'DB_NAME',
          config.get<string>('DB_DATABASE', 'inventory_db'),
        ),
        autoLoadEntities: true,
        synchronize:
          config.get<string>('NODE_ENV', 'development') === 'development',
        logging: ['error', 'warn'],
      }),
    }),
    SuppliersModule,
    WarehousesModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
