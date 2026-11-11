import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CategoriesModule } from './categories/categories.module.js';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { WarehousesModule } from './warehouses/warehouses.module.js';
import { ProductsModule } from './products/products.module.js';
import { StockMovementsModule } from './stock-movements/stock-movements.module.js';
import { StockMovementItemsModule } from './stock-movement-items/stock-movement-items.module.js';

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
      }),
    }),
    CategoriesModule,
    SuppliersModule,
    WarehousesModule,
    ProductsModule,
    StockMovementsModule,
    StockMovementItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


