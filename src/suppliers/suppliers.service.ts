import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import { Supplier } from './entities/supplier.entity.js';

@Injectable()
export class SuppliersService {
  constructor(@InjectRepository(Supplier) private readonly supplierRepository: Repository<Supplier>) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepository.create(dto);
    return this.supplierRepository.save(supplier);
  }

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOneBy({ id });
    if (!supplier) throw new NotFoundException('Pemasok ' + id + ' tidak ditemukan');
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);
    const updatedSupplier = this.supplierRepository.merge(supplier, dto);
    return this.supplierRepository.save(updatedSupplier);
  }

  async remove(id: string): Promise<{ message: string; deletedId: string }> {
    const supplier = await this.findOne(id);
    await this.supplierRepository.remove(supplier);
    return { message: 'Pemasok ' + id + ' berhasil dihapus', deletedId: id };
  }
}
