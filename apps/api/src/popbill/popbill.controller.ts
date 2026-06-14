import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IssueTaxInvoiceInput, PopbillService } from './popbill.service';

@Controller('popbill')
export class PopbillController {
  constructor(private readonly service: PopbillService) {}

  @Get('status')
  status() {
    return { enabled: this.service.isEnabled() };
  }

  @Post('issue')
  issue(@Body() body: IssueTaxInvoiceInput) {
    return this.service.issue(body);
  }

  @Post('collect-purchase')
  collect(@Query('year') year: string, @Query('month') month: string) {
    return this.service.collectPurchaseTaxInvoices(Number(year), Number(month));
  }

  @Get('history')
  history(@Query('direction') direction?: string, @Query('status') status?: string, @Query('limit') limit?: string) {
    return this.service.listHistory({
      direction,
      status,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
