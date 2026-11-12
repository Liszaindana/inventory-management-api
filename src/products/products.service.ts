import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockService } from '../stock/stock.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './entities/product.entity.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly stockService: StockService,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: { category: true, supplier: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { category: true, supplier: true },
    });

    if (!product) {
      throw new NotFoundException(`Produk dengan id ${id} tidak ditemukan`);
    }

    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(dto);

    return this.productRepository.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    Object.assign(product, dto);

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    const result = await this.productRepository.softDelete(id);

    if (!result.affected) {
      throw new NotFoundException(`Produk dengan id ${id} tidak ditemukan`);
    }

    return {
      message: 'Produk berhasil dihapus',
      id,
    };
  }

  async getStock(id: string) {
    const product = await this.findOne(id);
    const warehouses = await this.stockService.getWarehouseStock(product.id);
    const totalStock = warehouses.reduce(
      (total, warehouse) => total + warehouse.stock,
      0,
    );

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      minStock: product.minStock,
      totalStock,
      isLowStock: totalStock <= product.minStock,
      warehouses,
    };
  }
}
