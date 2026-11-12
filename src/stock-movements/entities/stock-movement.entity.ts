import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { StockMovementItem } from '../../stock-movement-items/entities/stock-movement-item.entity.js';
import { Warehouse } from '../../warehouses/entities/warehouse.entity.js';

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
}

@Entity('stock_movements')
export class StockMovement extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  referenceNumber: string;

  @Column({ type: 'varchar', length: 10 })
  type: StockMovementType;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.stockMovements, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  movementDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => StockMovementItem, (item) => item.movement, {
    cascade: true,
  })
  items: StockMovementItem[];
}
