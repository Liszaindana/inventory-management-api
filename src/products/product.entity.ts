import { Column, DeleteDateColumn, Entity } from 'typeorm';
import { AppBaseEntity } from '../common/entities/base.entity.js';

@Entity('products')
export class Product extends AppBaseEntity {
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

  @Column({ type: 'uuid', nullable: true })
  supplierId: string | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
