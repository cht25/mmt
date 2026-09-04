import { createContext, useContext } from "react";
import type { Customer, Gateway, Settings, Txn, TxnDraft } from "../types";

export interface StoreApi {
  state: import("../types").AppState;
  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addTxn: (t: TxnDraft) => Txn;
  updateTxn: (id: string, patch: Partial<Txn>) => void;
  deleteTxn: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addGateway: (g: Omit<Gateway, "id">) => void;
  updateGateway: (id: string, patch: Partial<Gateway>) => void;
  deleteGateway: (id: string) => void;
  importState: (state: import("../types").AppState) => void;
  resetAll: () => void;
  loadDemo: () => void;
}

export const StoreContext = createContext<StoreApi | null>(null);

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("StoreContext missing");
  return ctx;
}
