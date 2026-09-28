import { createContext } from "react";
import type { Business } from "@/types/business";

export type BusinessState = {
  business: Business;
  reload: () => void;
};

export const BusinessContext = createContext<BusinessState | null>(null);
