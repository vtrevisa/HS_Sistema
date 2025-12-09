import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Invoice } from "./types/invoice";

 type InvoicesResponse = Invoice[];

export function useInvoice() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await api.get<InvoicesResponse>('/invoices');
      return response.data;
    }
  });
}

