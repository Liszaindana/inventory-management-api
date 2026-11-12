import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateStockMovementDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsISO8601()
  movementDate?: string;
}
