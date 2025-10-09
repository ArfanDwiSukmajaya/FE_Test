import { LalinRepository, LalinFilters } from '../../domain/repositories/LalinRepository';
import { PaginationParams } from '../../domain/repositories/GerbangRepository';
import { PaymentMethod } from '../../domain/value-objects/PaymentMethod';
import { ErrorHandler } from '../../shared/utils/ErrorHandler';
import { ValidationUtils } from '../../shared/utils/ValidationUtils';

export interface ProcessedReportData {
  Ruas: string;
  Gerbang: string;
  Gardu: number;
  Tanggal: string;
  Hari: string;
  Gol: {
    [key: number]: {
      Tunai: number;
      KTP: number;
      Flo: number;
      EToll: number;
      Keseluruhan: number;
      ETF: number;
    };
  };
}

export interface ReportUseCaseResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ReportFilters extends LalinFilters {
  paymentMethod?: PaymentMethod;
}

export class ReportUseCase {
  constructor(private lalinRepository: LalinRepository) { }

  async getReportData(
    filters: ReportFilters,
    pagination: PaginationParams
  ): Promise<ReportUseCaseResult<{
    data: ProcessedReportData[];
    totalPages: number;
    currentPage: number;
  }>> {
    try {
      if (filters.search) {
        filters.search = ValidationUtils.sanitizeString(filters.search);
      }

      if (filters.tanggal) {
        const dateErrors = ValidationUtils.validateDate(filters.tanggal);
        if (dateErrors.length > 0) {
          return {
            success: false,
            error: dateErrors.join(', ')
          };
        }
      }

      const [lalinResponse, gerbangData] = await Promise.all([
        this.lalinRepository.getLalinData(filters, pagination),
        this.lalinRepository.getGerbangData()
      ]);

      const processedData = this.processLalinData(lalinResponse.data as unknown as Record<string, unknown>[], gerbangData);

      return {
        success: true,
        data: {
          data: processedData,
          totalPages: lalinResponse.total_pages,
          currentPage: lalinResponse.current_page
        }
      };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);

      return {
        success: false,
        error: ErrorHandler.getUserFriendlyMessage(appError)
      };
    }
  }

  async exportToPDF(
    data: ProcessedReportData[],
    filters: ReportFilters,
    paymentMethod: PaymentMethod
  ): Promise<ReportUseCaseResult<void>> {
    try {
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Tidak ada data untuk di-export'
        };
      }

      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF('landscape', 'mm', 'a4');

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Laporan Lalu Lintas Per Hari', 14, 20);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tanggal: ${filters.tanggal || new Date().toISOString().split('T')[0]}`, 14, 30);

      const tableData = data.map((row, index) => {
        const getValue = (gol: number) => {
          const golData = row.Gol[gol];
          if (!golData) return 0;
          return golData[paymentMethod.getValue()] || 0;
        };

        const totalLalin = [1, 2, 3, 4, 5].reduce((sum, gol) => sum + getValue(gol), 0);

        return [
          index + 1,
          row.Ruas,
          row.Gerbang,
          row.Gardu,
          row.Hari,
          row.Tanggal,
          paymentMethod.getDisplayName(),
          getValue(1),
          getValue(2),
          getValue(3),
          getValue(4),
          getValue(5),
          totalLalin
        ];
      });

      const headers = [
        'No.', 'Ruas', 'Gerbang', 'Gardu', 'Hari', 'Tanggal',
        'Metode Pembayaran', 'Gol I', 'Gol II', 'Gol III', 'Gol IV', 'Gol V', 'Total Lalin'
      ];

      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 40,
        margin: { left: 10, right: 10 },
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 12 },  // No
          1: { cellWidth: 35 },  // Ruas
          2: { cellWidth: 35 },  // Gerbang
          3: { cellWidth: 15 },  // Gardu
          4: { cellWidth: 18 },  // Hari
          5: { cellWidth: 20 },  // Tanggal
          6: { cellWidth: 25 },  // Metode Pembayaran
          7: { cellWidth: 15 },  // Gol I
          8: { cellWidth: 15 },  // Gol II
          9: { cellWidth: 20 },  // Gol III
          10: { cellWidth: 20 }, // Gol IV
          11: { cellWidth: 20 }, // Gol V
          12: { cellWidth: 20 }  // Total Lalin
        }
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Halaman ${i} dari ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
          doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
      }

      // Download PDF
      const fileName = `Laporan_Lalin_${(filters.tanggal || new Date().toISOString().split('T')[0]).replace(/-/g, '_')}.pdf`;
      doc.save(fileName);

      return {
        success: true
      };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);

      return {
        success: false,
        error: ErrorHandler.getUserFriendlyMessage(appError)
      };
    }
  }

  private processLalinData(
    lalinList: Record<string, unknown>[],
    gerbangList: Array<{
      id: number;
      IdCabang: number;
      NamaGerbang: string;
      NamaCabang: string;
    }>
  ): ProcessedReportData[] {

    const gerbangMap = new Map<string, { ruas: string; gerbang: string }>();

    gerbangList.forEach(g => {
      const key = `${g.IdCabang}-${g.id}`;
      gerbangMap.set(key, { ruas: g.NamaCabang, gerbang: g.NamaGerbang });
    });

    const groupedData = new Map<string, ProcessedReportData>();
    const uniqueKeys = new Set<string>();

    lalinList.forEach((lalin) => {
      // const key = `${lalin.IdCabang}-${lalin.IdGerbang}-${lalin.IdGardu}-${lalin.Tanggal}-${lalin.Golongan}`;
      const key = `${lalin.IdCabang}-${lalin.IdGerbang}-${lalin.IdGardu}-${lalin.Tanggal}`;
      uniqueKeys.add(key);

      const gerbangInfo = gerbangMap.get(`${lalin.IdCabang}-${lalin.IdGerbang}`);

      if (!gerbangInfo) return;

      if (!groupedData.has(key)) {
        const date = new Date(lalin.Tanggal as string);
        groupedData.set(key, {
          Ruas: gerbangInfo.ruas,
          Gerbang: gerbangInfo.gerbang,
          Gardu: lalin.IdGardu as number,
          Tanggal: lalin.Tanggal as string,
          Hari: date.toLocaleDateString('id-ID', { weekday: 'long' }),
          Gol: {}
        });
      }

      const existing = groupedData.get(key)!;
      if (!existing.Gol[lalin.Golongan as number]) {
        existing.Gol[lalin.Golongan as number] = {
          Tunai: 0,
          KTP: 0,
          Flo: 0,
          EToll: 0,
          Keseluruhan: 0,
          ETF: 0
        };
      }

      const gol = existing.Gol[lalin.Golongan as number];

      const eTollValue = ((lalin.eMandiri as number) + (lalin.eBri as number) + (lalin.eBni as number) + (lalin.eBca as number) + (lalin.eNobu as number) + (lalin.eDKI as number) + (lalin.eMega as number));

      gol.Tunai += lalin.Tunai as number;
      gol.KTP += ((lalin.DinasOpr as number) + (lalin.DinasMitra as number) + (lalin.DinasKary as number));
      gol.Flo += lalin.eFlo as number;
      gol.EToll += eTollValue;
      gol.Keseluruhan += (gol.Tunai + gol.KTP + gol.Flo + gol.EToll) as number;
      gol.ETF += (gol.EToll + gol.Tunai + gol.Flo) as number;

    });
    const result = Array.from(groupedData.values());
    return result;
  }
}
