import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { VatModule } from './vat/vat.module';
import { LedgerModule } from './ledger/ledger.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { MonthCloseModule } from './month-close/month-close.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { PopbillModule } from './popbill/popbill.module';
import { CodefModule } from './codef/codef.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    DashboardModule,
    VatModule,
    LedgerModule,
    SubscriptionsModule,
    MonthCloseModule,
    ChatbotModule,
    PopbillModule,
    CodefModule,
  ],
})
export class AppModule {}
