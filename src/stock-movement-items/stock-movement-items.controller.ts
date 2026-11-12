import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateStockMovementItemDto } from './dto/create-stock-movement-item.dto.js';
import { UpdateStockMovementItemDto } from './dto/update-stock-movement-item.dto.js';
import { StockMovementItemsService } from './stock-movement-items.service.js';

@Controller('stock-movement-items')
export class StockMovementItemsController {
  constructor(
    private readonly stockMovementItemsService: StockMovementItemsService,
  ) {}

  @Get()
  findAll(
    @Query('movementId', new ParseUUIDPipe({ optional: true }))
    movementId?: string,
  ) {
    return this.stockMovementItemsService.findAll(movementId);
  }

  @Post()
  create(@Body() dto: CreateStockMovementItemDto) {
    return this.stockMovementItemsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.stockMovementItemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockMovementItemDto,
  ) {
    return this.stockMovementItemsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.stockMovementItemsService.remove(id);
  }
}
