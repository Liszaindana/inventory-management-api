import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { In, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity.js';
import { StockService } from '../stock/stock.service.js';
import { Warehouse } from '../warehouses/entities/warehouse.entity.js';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto.js';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto.js';
import {
  StockMovement,
  StockMovementType,
} from './entities/stock-movement.entity.js';
import { StockMovementItem } from '../stock-movement-items/entities/stock-movement-item.entity.js';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,
    @InjectRepository(StockMovementItem)
    private readonly itemRepository: Repository<StockMovementItem>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly stockService: StockService,
  ) {}

  findAll(): Promise<StockMovement[]> {
    return this.movementRepository.find({
      relations: {
        warehouse: true,
        items: { product: true },
      },
      order: { movementDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<StockMovement> {
    const movement = await this.movementRepository.findOne({
      where: { id },
      relations: {
        warehouse: true,
        items: { product: true },
      },
    });

    if (!movement) {
      throw new NotFoundException(
        `Transaksi stok dengan id ${id} tidak ditemukan`,
      );
    }

    return movement;
  }

  async create(dto: CreateStockMovementDto): Promise<StockMovement> {
    await this.assertWarehouse(dto.warehouseId);

    const products = await this.assertProducts(
      dto.items.map((item) => item.productId),
    );

    if (dto.type === StockMovementType.OUT) {
      await this.assertStockAvailable(dto.items, dto.warehouseId, products);
    }

    const movement = this.movementRepository.create({
      referenceNumber: this.generateReferenceNumber(),
      type: dto.type,
      warehouseId: dto.warehouseId,
      movementDate: dto.movementDate ? new Date(dto.movementDate) : new Date(),
      notes: dto.notes ?? null,
      items: dto.items.map((item) =>
        this.itemRepository.create({
          productId: item.productId,
          quantity: item.quantity,
        }),
      ),
    });

    const saved = await this.movementRepository.save(movement);

    return this.findOne(saved.id);
  }

  async update(
    id: string,
    dto: UpdateStockMovementDto,
  ): Promise<StockMovement> {
    const movement = await this.findOne(id);

    if (dto.notes !== undefined) {
      movement.notes = dto.notes;
    }

    if (dto.movementDate !== undefined) {
      movement.movementDate = new Date(dto.movementDate);
    }

    await this.movementRepository.save(movement);

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    const result = await this.movementRepository.softDelete(id);

    if (!result.affected) {
      throw new NotFoundException(
        `Transaksi stok dengan id ${id} tidak ditemukan`,
      );
    }

    return {
      message: 'Transaksi stok berhasil di-void',
      id,
    };
  }

  private async assertWarehouse(warehouseId: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOneBy({
      id: warehouseId,
    });

    if (!warehouse) {
      throw new NotFoundException(
        `Gudang dengan id ${warehouseId} tidak ditemukan`,
      );
    }

    return warehouse;
  }

  private async assertProducts(
    productIds: string[],
  ): Promise<Map<string, Product>> {
    const uniqueIds = [...new Set(productIds)];

    if (uniqueIds.length !== productIds.length) {
      throw new BadRequestException(
        'Satu produk tidak boleh muncul lebih dari sekali dalam satu transaksi',
      );
    }

    const products = await this.productRepository.findBy({
      id: In(uniqueIds),
    });

    if (products.length !== uniqueIds.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missingIds = uniqueIds.filter((id) => !foundIds.has(id));

      throw new NotFoundException(
        `Produk tidak ditemukan: ${missingIds.join(', ')}`,
      );
    }

    return new Map(products.map((product) => [product.id, product]));
  }

  private async assertStockAvailable(
    items: CreateStockMovementDto['items'],
    warehouseId: string,
    products: Map<string, Product>,
  ): Promise<void> {
    for (const item of items) {
      const available = await this.stockService.getAvailableStock(
        item.productId,
        warehouseId,
      );

      if (available < item.quantity) {
        const product = products.get(item.productId);

        throw new BadRequestException(
          `Stok produk ${product?.sku ?? item.productId} tidak mencukupi. Tersedia ${available}, diminta ${item.quantity}`,
        );
      }
    }
  }

  private generateReferenceNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = randomUUID().slice(0, 8).toUpperCase();

    return `SM-${date}-${suffix}`;
  }
}
