export interface GerbangData {
  readonly id: number;
  readonly IdCabang: number;
  readonly NamaGerbang: string;
  readonly NamaCabang: string;
}

export class GerbangEntity implements GerbangData {
  constructor(
    public readonly id: number,
    public readonly IdCabang: number,
    public readonly NamaGerbang: string,
    public readonly NamaCabang: string
  ) { }

  static create(
    id: number,
    IdCabang: number,
    NamaGerbang: string,
    NamaCabang: string
  ): GerbangEntity {
    return new GerbangEntity(id, IdCabang, NamaGerbang, NamaCabang);
  }

  static fromApiResponse(data: {
    id: number;
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
  }): GerbangEntity {
    return new GerbangEntity(
      data.id,
      data.IdCabang,
      data.NamaGerbang,
      data.NamaCabang
    );
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.NamaGerbang || this.NamaGerbang.trim().length === 0) {
      errors.push('Nama Gerbang tidak boleh kosong');
    }

    if (!this.NamaCabang || this.NamaCabang.trim().length === 0) {
      errors.push('Nama Cabang tidak boleh kosong');
    }

    if (this.IdCabang <= 0) {
      errors.push('ID Cabang harus lebih dari 0');
    }

    return errors;
  }

  isEqual(other: GerbangEntity): boolean {
    return this.id === other.id && this.IdCabang === other.IdCabang;
  }
}
