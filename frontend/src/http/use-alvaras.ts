import { useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Alvara, Alvaras, ReleasePayload, SearchAlvarasPayload } from "./types/alvaras";

export type FlowState =
  "no-subscription"
  | "my-alvaras" 
  | "subscription-active"
  | "searching"
  | "search-result"
  | "payment-required"
  | "alvaras-released";

interface Plan {
  planName?: string;
  monthlyLimit: number;
  used: number;
  resetDate?: Date;
}

interface SearchResults {
  totalFound: number;
  available: number;
  extraNeeded?: number;
}


// const mockConsumedAlvaras: Alvaras[] = [
//  {
//   id: 1,
//   service: 'AVCB',
//   endDate: new Date('2025-03-15'),
//   address: 'Av. Paulista, 1578 - Bela Vista',
//   occupation: 'Comercial - Shopping',
//   city: 'São Paulo'
//  },
//  {
//   id: 2,
//   service: 'CLCB',
//   endDate: new Date('2025-04-20'),
//   address: 'Rua Augusta, 2350 - Consolação',
//   occupation: 'Comercial - Edifício Corporativo',
//   city: 'São Paulo'
//  },
//  {
//   id: 3,
//   service: 'AVCB',
//   endDate: new Date('2025-05-10'),
//   address: 'Av. Brigadeiro Faria Lima, 3477 - Itaim Bibi',
//   occupation: 'Comercial - Shopping',
//   city: 'São Paulo'
//  },
//  {
//   id: 4,
//   service: 'CLCB',
//   endDate: new Date('2025-06-25'),
//   address: 'Rua Oscar Freire, 908 - Jardins',
//   occupation: 'Comercial - Loja de Varejo',
//   city: 'São Paulo'
//  },
//  {
//   id: 5,
//   service: 'AVCB',
//   endDate: new Date('2025-02-28'),
//   address: 'Av. Rebouças, 3970 - Pinheiros',
//   occupation: 'Comercial - Shopping',
//   city: 'São Paulo'
//  }
// ]

export function useAlvaras({ monthlyLimit, used }: Plan) {
  const queryClient = useQueryClient();

  const [flowState, setFlowState] = useState<FlowState>("my-alvaras");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [allAlvaras, setAllAlvaras] = useState<Alvaras[]>([])
  const [releasedAlvaras, setReleasedAlvaras] = useState<Alvaras[]>([])

  //const [consumedAlvaras] = useState<Alvaras[]>(mockConsumedAlvaras)

  const { data: consumedAlvaras = [], refetch: refetchConsumedAlvaras } = useQuery<Alvaras[]>({
    queryKey: ["alvaras", "consumed"],
    queryFn: async () => {
      const { data } = await api.get("/alvaras/consumed");
      return data;
    },
    initialData: [],
  });

  function startNewQuery() {
    setFlowState('subscription-active')
    setSearchResults(null)
    setAllAlvaras([]);
    setReleasedAlvaras([]);
  }

  function cancelNewQuery() {
    setFlowState('my-alvaras')
    setSearchResults(null)
    setAllAlvaras([]);
    setReleasedAlvaras([]);
  }



  // Mutation para buscar alvarás filtrados
  const searchMutation = useMutation<Alvara[], Error, SearchAlvarasPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<{ alvaras: Alvara[] }>("/alvaras/search", payload);
      return data.alvaras;
    },
    onMutate: () => setFlowState('searching'),
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
          validity: randomDate,
          address: `Rua Exemplo ${i + 1}, Nº ${Math.floor(Math.random() * 500)}, Centro - ${payload.city}`,
          occupation: ["Comércio", "Residencial", "Serviços", "Industrial"][
            Math.floor(Math.random() * 4)
          ],
          city: payload.city
        }
      })

      setAllAlvaras(fakeArray);
      setReleasedAlvaras([]);

      // Update flowState based on search results
      setFlowState(totalFound <= available ? 'search-result' : 'payment-required');

      toast.success("Busca concluída", {
        description: `Encontramos ${totalFound} alvarás com os filtros aplicados.`,
      });
    },
    onError: () => {
      toast.error("Erro ao buscar alvarás");
    }
  });

  // Mutation para liberar alvarás e consumir créditos
 
  const releaseMutation = useMutation<{ creditsUsed: number; creditsAvailable: number; extraNeeded: number;  monthlyUsed: number; toRelease: Alvaras[] }, Error, ReleasePayload>({
    mutationFn: async (payload) => {

      const toRelease = allAlvaras.slice(0, payload.totalToRelease).filter((alvara) => !releasedAlvaras.some((release) => release.id === alvara.id));

      const { data } = await api.post("/alvaras/release", {
        ...payload,
        alvaras: toRelease.map((alvara) => ({
          service: alvara.service,
          city: alvara.city,
          address: alvara.address,
          occupation: alvara.occupation,
          validity: alvara.validity.toISOString().split("T")[0],
        })),
      });

     return { ...data, toRelease };
    },
    onSuccess: async ({ toRelease, ...data }) => {

      setReleasedAlvaras(prev => [...prev, ...toRelease]);

      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      setSearchResults(prev => prev
        ? {
            ...prev,
            available: data.creditsAvailable,
            extraNeeded: data.extraNeeded
          }
        : null
      )

      if (data.extraNeeded > 0) {
        setFlowState('payment-required')
        toast.info('Créditos insuficientes', {
          description: `Você precisa comprar ${data.extraNeeded} créditos extras.`
        })
        return
      }

      await refetchConsumedAlvaras();

      setFlowState('my-alvaras')
      toast.success('Alvarás liberados com sucesso!')
    },
    onError: () => {
      toast.error("Erro ao liberar alvarás");
    }
  });
  

  return {
    flowState,
    isActive: flowState !== 'no-subscription',
    consumedAlvaras,
    allAlvaras,
    releasedAlvaras,
    searchResults,
    searchAlvaras: searchMutation,
    releaseAlvaras: releaseMutation,
    startNewQuery,
    cancelNewQuery
  };

}