import { useState } from "react";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Alvara, SearchAlvarasPayload } from "./types/alvaras";

export type FlowState =
  | "no-subscription"
  | "subscription-active"
  | "search-result"
  | "payment-required"
  | "alvaras-released";


export function useAlvaras(subscriptionData: { monthlyLimit: number; used: number }) {
  //const queryClient = useQueryClient();
  const [isSearching, setIsSearching] = useState(false);
  const [alvarasData, setAlvarasData] = useState<Alvara[]>([]);
  const [searchResults, setSearchResults] = useState<{ totalFound: number; available: number } | null>(null);
  const [flowState, setFlowState] = useState<FlowState>("subscription-active");


   // Mutation para buscar alvarás filtrados
  const searchMutation = useMutation<Alvara[], Error, SearchAlvarasPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<{ alvaras: Alvara[] }>("/alvaras/search", payload);
      return data.alvaras;
    },
    onMutate: () => setIsSearching(true),
    onSuccess: (alvaras) => {
      setAlvarasData(alvaras);

      const totalFound = alvaras.length;
      const available = subscriptionData.monthlyLimit - subscriptionData.used; // aqui você pode pegar do plano do usuário

      setSearchResults({ totalFound, available });

      // Update flowState based on search results
      setFlowState(totalFound <= available ? 'search-result' : 'payment-required');

      toast.success("Busca concluída", {
        description: `Encontramos ${totalFound} alvarás com os filtros aplicados.`,
      });
    },
    onError: () => {
      toast.error("Erro ao buscar alvarás");
    },
    onSettled: () => setIsSearching(false),
  });

  // Here we create the "isActive" based on the flowState.
  const isActive = flowState !== 'payment-required';

  return {
    //alvaras: alvarasDB.data || [],
    isLoading: isSearching,
    alvarasData,
    searchAlvaras: searchMutation,
    searchResults,
    setSearchResults,
    isActive,
    flowState,
    setFlowState,

  };

}