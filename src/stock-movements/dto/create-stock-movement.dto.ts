import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { StockMovementType } from '../entities/stock-movement.entity.js';

export class StockMovementItemInputDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateStockMovementDto {
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @IsUUID()
  warehouseId: string;

  @IsOptional()
  @IsISO8601()
  movementDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockMovementItemInputDto)
  items: StockMovementItemInputDto[];
}
