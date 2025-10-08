export type PaymentMethodType = 'Tunai' | 'EToll' | 'Flo' | 'KTP' | 'Keseluruhan' | 'ETF';

export class PaymentMethod {
  private static readonly VALID_METHODS: PaymentMethodType[] = [
    'Tunai', 'EToll', 'Flo', 'KTP', 'Keseluruhan', 'ETF'
  ];

  private static readonly DISPLAY_NAMES: Record<PaymentMethodType, string> = {
    Tunai: 'Tunai',
    EToll: 'E-Toll',
    Flo: 'Flo',
    KTP: 'KTP',
    Keseluruhan: 'Keseluruhan',
    ETF: 'E-Toll+Tunai+Flo'
  };

  private static readonly TAB_NAMES: Record<PaymentMethodType, string> = {
    Tunai: 'Total Tunai',
    EToll: 'Total E-Toll',
    Flo: 'Total Flo',
    KTP: 'Total KTP',
    Keseluruhan: 'Total Keseluruhan',
    ETF: 'Total E-Toll+Tunai+Flo'
  };

  constructor(private readonly value: PaymentMethodType) {
    if (!PaymentMethod.VALID_METHODS.includes(value)) {
      throw new Error(`Invalid payment method: ${value}`);
    }
  }

  getValue(): PaymentMethodType {
    return this.value;
  }

  getDisplayName(): string {
    return PaymentMethod.DISPLAY_NAMES[this.value];
  }

  getTabName(): string {
    return PaymentMethod.TAB_NAMES[this.value];
  }

  static getAllMethods(): PaymentMethodType[] {
    return [...PaymentMethod.VALID_METHODS];
  }

  static getDisplayNames(): Record<PaymentMethodType, string> {
    return { ...PaymentMethod.DISPLAY_NAMES };
  }

  static getTabNames(): Record<PaymentMethodType, string> {
    return { ...PaymentMethod.TAB_NAMES };
  }

  equals(other: PaymentMethod): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
