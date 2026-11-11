import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity.js';
import { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    return await this.warehouseRepository.save(warehouse);
  }

  async findAll(): Promise<Warehouse[]> {
    return await this.warehouseRepository.find();
  }

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException(`Gudang dengan ID "${id}" tidak ditemukan`);
    }
    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    Object.assign(warehouse, updateWarehouseDto);
    return await this.warehouseRepository.save(warehouse);
  }

  async remove(id: string): Promise<void> {
    const warehouse = await this.findOne(id);
    // Master gudang dihapus secara permanen (hard delete)
    await this.warehouseRepository.remove(warehouse);
  }
}