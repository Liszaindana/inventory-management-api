import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovementItem } from '../stock-movement-items/entities/stock-movement-item.entity.js';

export interface WarehouseStock {
  warehouseId: string;
  code: string;
  name: string;
  totalIn: number;
  totalOut: number;
  stock: number;
}

interface RawWarehouseStock {
  warehouseId: string;
  code: string;
  name: string;
  totalIn: string;
  totalOut: string;
}

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockMovementItem)
    private readonly itemRepository: Repository<StockMovementItem>,
  ) {}

  /**
   * Stok dihitung dari item transaksi yang masih aktif:
   * stok = total quantity IN - total quantity OUT.
   * Transaksi yang sudah di-soft-delete tidak dihitung.
   */
  async getWarehouseStock(
    productId: string,
    warehouseId?: string,
  ): Promise<WarehouseStock[]> {
    const query = this.itemRepository
      .createQueryBuilder('item')
      .innerJoin('item.movement', 'movement')
      .innerJoin('movement.warehouse', 'warehouse')
      .select('warehouse.id', 'warehouseId')
      .addSelect('warehouse.code', 'code')
      .addSelect('warehouse.name', 'name')
      .addSelect(
        "COALESCE(SUM(CASE WHEN movement.type = 'IN' THEN item.quantity ELSE 0 END), 0)",
        'totalIn',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN movement.type = 'OUT' THEN item.quantity ELSE 0 END), 0)",
        'totalOut',
      )
      .where('item.productId = :productId', { productId })
      .andWhere('movement.deletedAt IS NULL')
      .groupBy('warehouse.id')
      .addGroupBy('warehouse.code')
      .addGroupBy('warehouse.name')
      .orderBy('warehouse.name', 'ASC');

    if (warehouseId) {
      query.andWhere('warehouse.id = :warehouseId', { warehouseId });
    }

    const rows = await query.getRawMany<RawWarehouseStock>();

    return rows.map((row) => {
      const totalIn = Number(row.totalIn);
      const totalOut = Number(row.totalOut);

      return {
        warehouseId: row.warehouseId,
        code: row.code,
        name: row.name,
        totalIn,
        totalOut,
        stock: totalIn - totalOut,
      };
    });
  }

  async getAvailableStock(
    productId: string,
    warehouseId: string,
  ): Promise<number> {
    const stock = await this.getWarehouseStock(productId, warehouseId);

    return stock[0]?.stock ?? 0;
  }

  async getTotalStock(productId: string): Promise<number> {
    const stock = await this.getWarehouseStock(productId);

    return stock.reduce((total, warehouse) => total + warehouse.stock, 0);
  }
}
