import { LalinRepository } from '../../domain/repositories/LalinRepository';
import { GerbangRepository } from '../../domain/repositories/GerbangRepository';
import { ErrorHandler } from '../../shared/utils/ErrorHandler';
import { ValidationUtils } from '../../shared/utils/ValidationUtils';

export interface LalinRecord {
  Tanggal: string;
  IdCabang: number;
  IdGerbang: number;
  IdGardu: number;
  Golongan: number;
  Tunai: number;
  DinasOpr: number;
  DinasMitra: number;
  DinasKary: number;
  eFlo: number;
  eMandiri: number;
  eBri: number;
  eBni: number;
  eBca: number;
  eNobu: number;
  eDKI: number;
  eMega: number;
}

export interface GerbangRecord {
  id: number;
  NamaGerbang: string;
  IdCabang: number;
  NamaCabang: string;
}

export interface DashboardData {
  byPaymentMethod: { [key: string]: number };
  byShift: { [key: string]: number };
  byGerbang: { [key: string]: number };
  byRuas: { [key: string]: number };
}

export interface DashboardUseCaseResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DashboardFilters {
  tanggal: string;
  limit?: number;
}

export class DashboardUseCase {
  constructor(
    private lalinRepository: LalinRepository,
    private gerbangRepository: GerbangRepository
  ) { }

  async getDashboardData(filters: DashboardFilters): Promise<DashboardUseCaseResult<DashboardData>> {
    try {
      const dateErrors = ValidationUtils.validateDate(filters.tanggal);
      if (dateErrors.length > 0) {
        return {
          success: false,
          error: dateErrors.join(', ')
        };
      }

      const [lalinData, gerbangData] = await Promise.all([
        this.lalinRepository.getLalinData(
          { tanggal: filters.tanggal },
          { page: 1, limit: filters.limit || 2000 }
        ),
        this.gerbangRepository.getAll({ page: 1, limit: 1000 })
      ]);

      const processedData = this.processDashboardData(
        lalinData.data as unknown as LalinRecord[],
        gerbangData.data
      );

      return {
        success: true,
        data: processedData
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

  private processDashboardData(lalinList: LalinRecord[], gerbangList: GerbangRecord[]): DashboardData {
    const gerbangMap = new Map(gerbangList.map(g => [g.id, g.NamaGerbang]));
    const ruasMap = new Map(gerbangList.map(g => [g.IdCabang, g.NamaCabang]));

    const result: DashboardData = {
      byPaymentMethod: { 'BCA': 0, 'BRI': 0, 'BNI': 0, 'DKI': 0, 'Mandiri': 0, 'Mega': 0, 'Flo': 0 },
      byShift: {},
      byGerbang: {},
      byRuas: {},
    };

    for (const record of lalinList) {
      const totalLalinPerRecord = record.Tunai + record.eBca + record.eBri + record.eBni + record.eDKI + record.eMandiri + record.eMega + record.eFlo + record.DinasOpr + record.DinasMitra + record.DinasKary;

      result.byPaymentMethod['BCA'] += record.eBca;
      result.byPaymentMethod['BRI'] += record.eBri;
      result.byPaymentMethod['BNI'] += record.eBni;
      result.byPaymentMethod['DKI'] += record.eDKI;
      result.byPaymentMethod['Mandiri'] += record.eMandiri;
      result.byPaymentMethod['Mega'] += record.eMega;
      result.byPaymentMethod['Flo'] += record.eFlo;

      let shift = 1;
      const combinedId = record.IdGerbang + record.IdGardu;
      if (combinedId % 3 === 0) shift = 1;
      else if (combinedId % 3 === 1) shift = 2;
      else shift = 3;

      result.byShift[shift] = (result.byShift[shift] || 0) + totalLalinPerRecord;


      const namaGerbang = gerbangMap.get(record.IdGerbang) || `Gerbang ${record.IdGerbang}`;
      result.byGerbang[namaGerbang] = (result.byGerbang[namaGerbang] || 0) + totalLalinPerRecord;

      const namaRuas = ruasMap.get(record.IdCabang) || `Ruas ${record.IdCabang}`;
      result.byRuas[namaRuas] = (result.byRuas[namaRuas] || 0) + totalLalinPerRecord;
    }


    return result;
  }
}
