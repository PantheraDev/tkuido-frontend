// src/hook/useSelectedPlan.ts
// Lee el plan elegido en la landing (guardado en localStorage por Plan.tsx)
// y lo valida antes de usarlo en los procesadores de pago.
import { useMemo } from "react";

export type SelectedPlan = {
  id?: number;
  name: string;
  price: number;
};

const getSelectedPlan = (): SelectedPlan | null => {
  const raw = localStorage.getItem("selectedPlan");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SelectedPlan;
    if (parsed?.name && typeof parsed.price === "number") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const useSelectedPlan = (): SelectedPlan | null =>
  useMemo(() => getSelectedPlan(), []);
