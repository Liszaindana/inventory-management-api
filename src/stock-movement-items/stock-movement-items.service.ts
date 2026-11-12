import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity.js';
import { StockService } from '../stock/stock.service.js';
import {
  StockMovement,
  StockMovementType,
} from '../stock-movements/entities/stock-movement.entity.js';
import { CreateStockMovementItemDto } from './dto/create-stock-movement-item.dto.js';
import { UpdateStockMovementItemDto } from './dto/update-stock-movement-item.dto.js';
import { StockMovementItem } from './entities/stock-movement-item.entity.js';

@Injectable()
export class StockMovementItemsService {
  constructor(
    @InjectRepository(StockMovementItem)
    private readonly itemRepository: Repository<StockMovementItem>,
    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly stockService: StockService,
  ) {}

  findAll(movementId?: string): Promise<StockMovementItem[]> {
    return this.itemRepository.find({
      where: movementId ? { movementId } : {},
      relations: {
        movement: { warehouse: true },
        product: true,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<StockMovementItem> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: {
        movement: { warehouse: true },
        product: true,
      },
    });

    if (!item) {
      throw new NotFoundException(
        `Item transaksi stok dengan id ${id} tidak ditemukan`,
      );
    }

    return item;
  }

  async create(dto: CreateStockMovementItemDto): Promise<StockMovementItem> {
    const movement = await this.getActiveMovement(dto.movementId);

    await this.getProduct(dto.productId);
    await this.assertUniqueProduct(movement.id, dto.productId);

    if (movement.type === StockMovementType.OUT) {
      await this.assertStockAvailable(movement, dto.productId, dto.quantity);
    }

    const item = this.itemRepository.create(dto);
    const saved = await this.itemRepository.save(item);

    return this.findOne(saved.id);
  }

  async update(
    id: string,
    dto: UpdateStockMovementItemDto,
  ): Promise<StockMovementItem> {
    const item = await this.findOne(id);
    const movement = await this.getActiveMovement(item.movementId);
    const newProductId = dto.productId ?? item.productId;
    const newQuantity = dto.quantity ?? item.quantity;

    if (dto.productId && dto.productId !== item.productId) {
      await this.getProduct(newProductId);
      await this.assertUniqueProduct(movement.id, newProductId);
    }

    if (movement.type === StockMovementType.OUT) {
      let available = await this.stockService.getAvailableStock(
        newProductId,
        movement.warehouseId,
      );

      if (newProductId === item.productId) {
        available += item.quantity;
      }

      if (available < newQuantity) {
        throw new BadRequestException(
          `Stok produk tidak mencukupi. Tersedia ${available}, diminta ${newQuantity}`,
        );
      }
    }

    item.productId = newProductId;
    item.quantity = newQuantity;
    await this.itemRepository.save(item);

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    const item = await this.findOne(id);

    await this.getActiveMovement(item.movementId);
    await this.itemRepository.remove(item);

    return {
      message: 'Item transaksi stok berhasil dihapus',
      id,
    };
  }

  private async getActiveMovement(id: string): Promise<StockMovement> {
    const movement = await this.movementRepository.findOneBy({ id });

    if (!movement) {
      throw new NotFoundException(
        `Transaksi stok dengan id ${id} tidak ditemukan`,
      );
    }

    return movement;
  }

  private async getProduct(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Produk dengan id ${id} tidak ditemukan`);
    }

    return product;
  }

  private async assertUniqueProduct(
    movementId: string,
    productId: string,
  ): Promise<void> {
    const existing = await this.itemRepository.findOneBy({
      movementId,
      productId,
    });

    if (existing) {
      throw new ConflictException(
        'Produk sudah tercatat pada transaksi stok ini',
      );
    }
  }

  private async assertStockAvailable(
    movement: StockMovement,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const available = await this.stockService.getAvailableStock(
      productId,
      movement.warehouseId,
    );

    if (available < quantity) {
      throw new BadRequestException(
        `Stok produk tidak mencukupi. Tersedia ${available}, diminta ${quantity}`,
      );
    }
  }
}
