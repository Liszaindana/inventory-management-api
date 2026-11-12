import { Check, Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Product } from '../../products/entities/product.entity.js';
import { StockMovement } from '../../stock-movements/entities/stock-movement.entity.js';

@Entity('stock_movement_items')
@Unique('UQ_stock_movement_items_movement_product', ['movementId', 'productId'])
@Check('CHK_stock_movement_items_quantity_positive', '"quantity" > 0')
export class StockMovementItem extends BaseEntity {
  @Column({ type: 'uuid' })
  movementId: string;

  @ManyToOne(() => StockMovement, (movement) => movement.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movementId' })
  movement: StockMovement;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.stockMovementItems, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;
}
