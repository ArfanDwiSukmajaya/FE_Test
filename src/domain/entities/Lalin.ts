export interface LalinData {
  readonly Tanggal: string;
  readonly IdCabang: number;
  readonly IdGerbang: number;
  readonly IdGardu: number;
  readonly Golongan: number;
  readonly Tunai: number;
  readonly DinasOpr: number;
  readonly DinasMitra: number;
  readonly DinasKary: number;
  readonly eFlo: number;
  readonly eMandiri: number;
  readonly eBri: number;
  readonly eBni: number;
  readonly eBca: number;
  readonly eNobu: number;
  readonly eDKI: number;
  readonly eMega: number;
}

export class LalinEntity implements LalinData {
  constructor(
    public readonly Tanggal: string,
    public readonly IdCabang: number,
    public readonly IdGerbang: number,
    public readonly IdGardu: number,
    public readonly Golongan: number,
    public readonly Tunai: number,
    public readonly DinasOpr: number,
    public readonly DinasMitra: number,
    public readonly DinasKary: number,
    public readonly eFlo: number,
    public readonly eMandiri: number,
    public readonly eBri: number,
    public readonly eBni: number,
    public readonly eBca: number,
    public readonly eNobu: number,
    public readonly eDKI: number,
    public readonly eMega: number
  ) { }

  static fromApiResponse(data: LalinData): LalinEntity {
    return new LalinEntity(
      data.Tanggal,
      data.IdCabang,
      data.IdGerbang,
      data.IdGardu,
      data.Golongan,
      data.Tunai,
      data.DinasOpr,
      data.DinasMitra,
      data.DinasKary,
      data.eFlo,
      data.eMandiri,
      data.eBri,
      data.eBni,
      data.eBca,
      data.eNobu,
      data.eDKI,
      data.eMega
    );
  }

  getTotalEToll(): number {
    return this.eMandiri + this.eBri + this.eBni + this.eBca + this.eNobu + this.eDKI + this.eMega;
  }

  getTotalKTP(): number {
    return this.DinasOpr + this.DinasMitra + this.DinasKary;
  }

  getTotalKeseluruhan(): number {
    return this.Tunai + this.getTotalEToll() + this.eFlo + this.getTotalKTP();
  }

  getTotalETF(): number {
    return this.getTotalEToll() + this.Tunai + this.eFlo;
  }

  getValueByMethod(method: 'Tunai' | 'EToll' | 'Flo' | 'KTP' | 'Keseluruhan' | 'ETF'): number {
    switch (method) {
      case 'Tunai': return this.Tunai;
      case 'EToll': return this.getTotalEToll();
      case 'Flo': return this.eFlo;
      case 'KTP': return this.getTotalKTP();
      case 'Keseluruhan': return this.getTotalKeseluruhan();
      case 'ETF': return this.getTotalETF();
      default: return 0;
    }
  }
}
