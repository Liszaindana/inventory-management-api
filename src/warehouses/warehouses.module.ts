import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehousesService } from './warehouses.service.js';
import { WarehousesController } from './warehouses.controller.js';
import { Warehouse } from './entities/warehouse.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse])],
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [WarehousesService, TypeOrmModule],
})
export class WarehousesModule {}