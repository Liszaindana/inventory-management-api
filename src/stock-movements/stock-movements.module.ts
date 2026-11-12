import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity.js';
import { StockMovementItem } from '../stock-movement-items/entities/stock-movement-item.entity.js';
import { StockModule } from '../stock/stock.module.js';
import { Warehouse } from '../warehouses/entities/warehouse.entity.js';
import { StockMovement } from './entities/stock-movement.entity.js';
import { StockMovementsController } from './stock-movements.controller.js';
import { StockMovementsService } from './stock-movements.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockMovement,
      StockMovementItem,
      Warehouse,
      Product,
    ]),
    StockModule,
  ],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
})
export class StockMovementsModule {}
