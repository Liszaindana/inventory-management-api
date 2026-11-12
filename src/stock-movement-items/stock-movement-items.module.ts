import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity.js';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity.js';
import { StockModule } from '../stock/stock.module.js';
import { StockMovementItem } from './entities/stock-movement-item.entity.js';
import { StockMovementItemsController } from './stock-movement-items.controller.js';
import { StockMovementItemsService } from './stock-movement-items.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockMovementItem, StockMovement, Product]),
    StockModule,
  ],
  controllers: [StockMovementItemsController],
  providers: [StockMovementItemsService],
})
export class StockMovementItemsModule {}
