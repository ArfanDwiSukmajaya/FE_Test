// application/use-cases/ReportUseCase.ts
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
      // Sanitize search input
      if (filters.search) {
        filters.search = ValidationUtils.sanitizeString(filters.search);
      }

      // Validate date if provided
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

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Laporan Lalu Lintas Per Hari', 14, 20);

      // Tanggal laporan
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tanggal: ${filters.tanggal || new Date().toISOString().split('T')[0]}`, 14, 30);

      // Data untuk tabel
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

      // Kolom headers
      const headers = [
        'No.', 'Ruas', 'Gerbang', 'Gardu', 'Hari', 'Tanggal',
        'Metode Pembayaran', 'Gol I', 'Gol II', 'Gol III', 'Gol IV', 'Gol V', 'Total Lalin'
      ];

      // Buat tabel
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 15 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 },
          3: { cellWidth: 20 }, 4: { cellWidth: 20 }, 5: { cellWidth: 25 },
          6: { cellWidth: 30 }, 7: { cellWidth: 20 }, 8: { cellWidth: 20 },
          9: { cellWidth: 20 }, 10: { cellWidth: 20 }, 11: { cellWidth: 20 },
          12: { cellWidth: 25 }
        }
      });

      // Footer
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

    lalinList.forEach(lalin => {
      const key = `${lalin.IdCabang}-${lalin.IdGerbang}-${lalin.IdGardu}-${lalin.Tanggal}`;
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
      gol.Tunai += lalin.Tunai as number;
      gol.KTP += ((lalin.DinasOpr as number) + (lalin.DinasMitra as number) + (lalin.DinasKary as number));
      gol.Flo += lalin.eFlo as number;
      gol.EToll += ((lalin.eMandiri as number) + (lalin.eBri as number) + (lalin.eBni as number) + (lalin.eBca as number) + (lalin.eNobu as number) + (lalin.eDKI as number) + (lalin.eMega as number));
      gol.Keseluruhan += (gol.Tunai + gol.KTP + gol.Flo + gol.EToll) as number;
      gol.ETF += (gol.EToll + gol.Tunai + gol.Flo) as number;
    });

    return Array.from(groupedData.values());
  }
}
