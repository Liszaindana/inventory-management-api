import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { StockMovementItem } from '../../stock-movement-items/entities/stock-movement-item.entity.js';
import { Supplier } from '../../suppliers/entities/supplier.entity.js';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  price: number;

  @Column({ type: 'int', default: 0 })
  minStock: number;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Column({ type: 'uuid', nullable: true })
  supplierId: string | null;

  @ManyToOne(() => Supplier, (supplier) => supplier.products, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => StockMovementItem, (item) => item.product)
  stockMovementItems: StockMovementItem[];
}
