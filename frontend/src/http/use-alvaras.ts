import { useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Alvara, AlvarasFake, SearchAlvarasPayload } from "./types/alvaras";

export type FlowState =
  | "no-subscription"
  | "subscription-active"
  | "search-result"
  | "payment-required"
  | "alvaras-released";

interface Plan {
  planName?: string;
  monthlyLimit: number;
  used: number;
  resetDate?: Date;
}


export function useAlvaras({ monthlyLimit, used }: Plan) {
  const queryClient = useQueryClient();
  const [isSearching, setIsSearching] = useState(false);
  const [alvarasData, setAlvarasData] = useState<AlvarasFake[]>([]);
  const [searchResults, setSearchResults] = useState<{ totalFound: number; available: number } | null>(null);
  const [flowState, setFlowState] = useState<FlowState>("subscription-active");

  // Mutation para buscar alvarás filtrados
  const searchMutation = useMutation<Alvara[], Error, SearchAlvarasPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<{ alvaras: Alvara[] }>("/alvaras/search", payload);
      return data.alvaras;
    },
    onMutate: () => setIsSearching(true),
    onSuccess: (alvaras, payload) => {

      const totalFound = alvaras.reduce((sum, item) => {
        return sum + (item.avcb ?? 0) + (item.clcb ?? 0);
      }, 0);

      const available = monthlyLimit - used; 

      setSearchResults({ totalFound, available });

      const fakeArray = Array.from({ length: totalFound }, (_, i) => {
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 90));

        return {
          id: i + 1,
          service: payload.selectedTypeFilter === "Todos" ? Math.random() > 0.5 ? "AVCB" : "CLCB" : payload.selectedTypeFilter,
          endDate: randomDate,
          address: `Rua Exemplo ${i + 1}, Nº ${Math.floor(Math.random() * 500)}, Centro - Cidade Teste`,
          occupation: ["Comércio", "Residencial", "Serviços", "Industrial"][
            Math.floor(Math.random() * 4)
          ]
        }
      })

      setAlvarasData(fakeArray);


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

  // Mutation para liberar alvarás e consumir créditos
 
  const releaseMutation = useMutation<{ creditsUsed: number; creditsAvailable: number; extraNeeded: number },Error,{ totalToRelease: number }>({
    mutationFn: async ({ totalToRelease }) => {
      const { data } = await api.post("/alvaras/release", { totalToRelease });
      return data;
    },
    onSuccess: ({ extraNeeded }) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      if (extraNeeded > 0) {
        setFlowState("payment-required");
        toast.info("Créditos insuficientes", {
          description: `Você precisa comprar ${extraNeeded} créditos extras.`,
        });
      } else {
        setFlowState("alvaras-released");
        toast.success("Alvarás liberados com sucesso!");
      }
    },
    onError: () => {
      toast.error("Erro ao liberar alvarás");
    },
  });
  
  // Here we create the "isActive" based on the flowState.
  const isActive = flowState !== 'payment-required';

  return {
    //alvaras: alvarasDB.data || [],
    isLoading: isSearching,
    alvarasData,
    searchAlvaras: searchMutation,
    releaseAlvaras: releaseMutation,
    searchResults,
    setSearchResults,
    isActive,
    flowState,
    setFlowState,

  };

}