import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovementItem } from '../stock-movement-items/entities/stock-movement-item.entity.js';
import { StockService } from './stock.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovementItem])],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
