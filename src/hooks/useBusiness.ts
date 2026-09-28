import { useContext } from "react";
import { BusinessContext, type BusinessState } from "@/contexts/business-context";

export function useBusiness(): BusinessState {
  const context = useContext(BusinessContext);
  if (!context) throw new Error("useBusiness must be used within a BusinessLayout.");
  return context;
}
