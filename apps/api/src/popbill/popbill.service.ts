import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';

export interface IssueTaxInvoiceInput {
  invoiceId?: string;
  projectId?: string;
  direction: 'sales' | 'purchase';
  supplierCorpNum: string;
  supplierName: string;
  buyerCorpNum: string;
  buyerName: string;
  supplyAmount: number;
  vatAmount: number;
  totalAmount: number;
  issueDate: Date;
  memo?: string;
  items: { name: string; qty: number; unitPrice: number; amount: number }[];
}

@Injectable()
export class PopbillService {
  private readonly logger = new Logger(PopbillService.name);
  private readonly enabled: boolean;

  constructor(@Inject('PRISMA') private readonly prisma: any) {
    this.enabled = Boolean(
      process.env.POPBILL_LINK_ID && process.env.POPBILL_SECRET_KEY,
    );
    if (!this.enabled) {
      this.logger.warn('팝빌 API 키 미설정 → 모의(mock) 발행 모드');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 전자세금계산서 발행
   * - 팝빌 환경변수가 있으면 실제 SDK 호출
   * - 없으면 mock 응답을 DB에 저장 (개발용)
   */
  async issue(input: IssueTaxInvoiceInput) {
    if (input.supplyAmount + input.vatAmount !== input.totalAmount) {
      throw new BadRequestException('공급가액+세액 = 합계가 일치해야 합니다.');
    }

    const record = await this.prisma.taxInvoice.create({
      data: {
        invoiceId: input.invoiceId,
        projectId: input.projectId,
        direction: input.direction,
        status: this.enabled ? 'requested' : 'draft',
        supplierCorpNum: input.supplierCorpNum,
        supplierName: input.supplierName,
        buyerCorpNum: input.buyerCorpNum,
        buyerName: input.buyerName,
        supplyAmount: input.supplyAmount,
        vatAmount: input.vatAmount,
        totalAmount: input.totalAmount,
        issueDate: input.issueDate,
        memo: input.memo,
      },
    });

    if (!this.enabled) {
      // 모의 발행: 5초 후 transmitted 처리 (실제로는 팝빌 webhook)
      setTimeout(() => {
        this.prisma.taxInvoice.update({
          where: { id: record.id },
          data: {
            status: 'transmitted',
            ntsConfirmNum: `MOCK${Date.now()}`,
            rawResponse: JSON.stringify({ mock: true, message: 'API 키가 설정되지 않아 모의 발행 처리됨' }),
          },
        }).catch((e) => this.logger.error('mock update failed', e));
      }, 1500);
      return { ok: true, mock: true, taxInvoice: record };
    }

    // 실제 팝빌 연동 코드 자리 (SDK 동적 import)
    // const popbill = await import('popbill');
    // ... SDK 호출 + 응답을 rawResponse에 저장 + status 업데이트
    this.logger.log(`팝빌 실제 발행 호출 자리: ${record.id}`);
    return { ok: true, mock: false, taxInvoice: record, message: 'SDK 호출 코드를 추가하세요' };
  }

  /**
   * 매입 세금계산서 조회 (홈택스)
   */
  async collectPurchaseTaxInvoices(year: number, month: number) {
    if (!this.enabled) {
      this.logger.warn('팝빌 미설정 - 모의 매입 데이터 없음');
      return { ok: true, mock: true, count: 0 };
    }
    // 팝빌 홈택스 매입/매출 조회 API 호출 자리
    return { ok: true, mock: false, count: 0, message: 'SDK 호출 코드를 추가하세요' };
  }

  async listHistory(opts: { direction?: string; status?: string; limit?: number } = {}) {
    return this.prisma.taxInvoice.findMany({
      where: {
        direction: opts.direction,
        status: opts.status,
      },
      orderBy: { issueDate: 'desc' },
      take: opts.limit ?? 50,
    });
  }
}
