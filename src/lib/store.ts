import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppState, Customer, Gateway, Settings, Txn, TxnDraft } from "../types";
import { defaultState, todayISO, uid } from "./calc";
import { buildDemoState } from "./seed";

const STORAGE_KEY = "mmt-talikhata-v1";

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !parsed.settings || !Array.isArray(parsed.customers) || !Array.isArray(parsed.txns)) {
      return defaultState();
    }
    return {
      settings: { ...defaultState().settings, ...parsed.settings },
      customers: parsed.customers,
      txns: parsed.txns,
    };
  } catch {
    return defaultState();
  }
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full/blocked */
    }
  }, [state]);

  const addCustomer = useCallback((c: Omit<Customer, "id" | "createdAt">): Customer => {
    const full: Customer = { ...c, id: uid(), createdAt: todayISO() };
    setState((s) => ({ ...s, customers: [...s.customers, full] }));
    return full;
  }, []);

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setState((s) => ({
      ...s,
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      customers: s.customers.filter((c) => c.id !== id),
      txns: s.txns.filter((t) => t.customerId !== id),
    }));
  }, []);

  const addTxn = useCallback((draft: TxnDraft): Txn => {
    const txn: Txn = {
      id: uid(),
      customerId: draft.customerId,
      type: draft.type,
      amount: Math.round(draft.amount * 100) / 100,
      date: draft.date,
      note: draft.note ?? "",
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, txns: [...s.txns, txn] }));
    return txn;
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const addGateway = useCallback((g: Omit<Gateway, "id">) => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, gateways: [...(s.settings.gateways ?? []), { ...g, id: uid() }] },
    }));
  }, []);

  const updateGateway = useCallback((id: string, patch: Partial<Gateway>) => {
    setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        gateways: (s.settings.gateways ?? []).map((g) => (g.id === id ? { ...g, ...patch } : g)),
      },
    }));
  }, []);

  const deleteGateway = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        gateways: (s.settings.gateways ?? []).filter((g) => g.id !== id),
      },
    }));
  }, []);

  const importState = useCallback((next: AppState) => {
    setState({
      settings: { ...defaultState().settings, ...next.settings },
      customers: next.customers,
      txns: next.txns,
    });
  }, []);

  const resetAll = useCallback(() => setState(defaultState()), []);
  const loadDemo = useCallback(() => setState(buildDemoState()), []);

  const api = useMemo(
    () => ({
      state,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addTxn,
      updateSettings,
      addGateway,
      updateGateway,
      deleteGateway,
      importState,
      resetAll,
      loadDemo,
    }),
    [
      state,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addTxn,
      updateSettings,
      addGateway,
      updateGateway,
      deleteGateway,
      importState,
      resetAll,
      loadDemo,
    ],
  );

  return api;
}
