import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CashflowsService, CreateCashflowDto } from './cashflows.service';

@Controller('cashflows')
export class CashflowsController {
  constructor(private readonly service: CashflowsService) {}

  @Get()
  list(
    @Query('type') type?: string,
    @Query('projectId') projectId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.list({
      type,
      projectId,
      limit: limit ? Number(limit) : 100,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: CreateCashflowDto) {
    return this.service.create(body);
  }
}
