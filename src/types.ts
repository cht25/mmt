export type View = "dashboard" | "customers" | "customer" | "transactions" | "reports" | "settings";

export type Lang = "bn" | "en";

export type PartyType = "customer" | "supplier";

/** Transaction types (khata entries) */
export type TxnType = "sale" | "payment_in" | "purchase" | "payment_out";

/** Direction of money relative to the business:
 *  "give"  -> business gave goods/money, party owes the business   (+balance)
 *  "take"  -> business took goods/money from party, business owes   (-balance)
 */
export type Direction = "give" | "take";

export interface Settings {
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  language: Lang;
  bengaliDigits: boolean;
  dark: boolean;
  themeColor: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: PartyType;
  note: string;
  createdAt: string; // ISO date
}

export interface Txn {
  id: string;
  customerId: string;
  type: TxnType;
  amount: number; // positive
  date: string; // ISO date (yyyy-mm-dd)
  note: string;
  createdAt: number;
}

export interface AppState {
  settings: Settings;
  customers: Customer[];
  txns: Txn[];
}

export interface BalanceMap {
  [customerId: string]: number;
}

export interface TxnDraft {
  customerId: string;
  type: TxnType;
  amount: number;
  date: string;
  note?: string;
}
