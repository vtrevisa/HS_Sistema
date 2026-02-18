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

export function useAlvaras({ monthlyLimit, used }: Plan) {
  const queryClient = useQueryClient();

  const [flowState, setFlowState] = useState<FlowState>("my-alvaras");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [allAlvaras, setAllAlvaras] = useState<Alvaras[]>([])
  const [pendingAlvaras, setPendingAlvaras] = useState<Alvaras[]>([])
  const [releasedAlvaras, setReleasedAlvaras] = useState<Alvaras[]>([])


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

      // Gera array fake de alvarás filtrando duplicados do banco
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



      // Filtra alvarás que já existem no banco
      const filteredFakeArray = fakeArray.filter(fake =>
        !consumedAlvaras.some(consumed =>
          consumed.service === fake.service &&
          consumed.city === fake.city &&
          consumed.address === fake.address &&
          new Date(consumed.validity).toDateString() === fake.validity.toDateString()
        )
      );

      setAllAlvaras(filteredFakeArray);
      setReleasedAlvaras([]);

      // Update flowState based on search results
      setFlowState(filteredFakeArray.length <= available ? 'search-result' : 'payment-required');

      toast.success("Busca concluída", {
        description: `Encontramos ${filteredFakeArray.length} alvarás com os filtros aplicados.`,
      });
    },
    onError: () => {
      toast.error("Erro ao buscar alvarás");
    }
  });

  // Mutation para liberar alvarás e consumir créditos
 
  const releaseMutation = useMutation<{ creditsUsed: number; creditsAvailable: number; extraNeeded: number;  monthlyUsed: number; savedAlvaras: number; }, Error, ReleasePayload>({
    mutationFn: async (payload) => {

      // const toRelease = allAlvaras.slice(0, payload.totalToRelease).filter(alvara => !releasedAlvaras.some(release => release.id === alvara.id) && !consumedAlvaras.some(consumed => consumed.service === alvara.service &&
      //   consumed.city === alvara.city && consumed.address === alvara.address && new Date(consumed.validity).toDateString() === alvara.validity.toDateString())
      // );


      const eligibleAlvaras = allAlvaras.filter(alvara => {
        const alreadyReleased = releasedAlvaras.some(release => release.id === alvara.id)

        const alreadyConsumed = consumedAlvaras.some(consumed =>
          consumed.service === alvara.service &&
          consumed.city === alvara.city &&
          consumed.address === alvara.address &&
          new Date(consumed.validity).toDateString() === alvara.validity.toDateString()
        )

        return !alreadyReleased && !alreadyConsumed
      })

      const toRelease = pendingAlvaras.length > 0 ? pendingAlvaras : eligibleAlvaras.slice(0, payload.totalToRelease)

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

      return data;
    },
    onSuccess: async (data) => {

      await refetchConsumedAlvaras();

      const newReleased = allAlvaras.slice(0, data.savedAlvaras).filter(alvara => !releasedAlvaras.some(release => release.id === alvara.id));

      setReleasedAlvaras(prev => [...prev, ...newReleased]);

      setSearchResults(prev => prev
        ? {
            ...prev,
            available: data.creditsAvailable,
            extraNeeded: data.extraNeeded
          }
        : null
      )

      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      if (data.extraNeeded > 0) {
        setPendingAlvaras(newReleased.length > 0 ? newReleased : pendingAlvaras)

        setFlowState('payment-required')

        toast.info('Créditos insuficientes', {
          description: `Você precisa comprar ${data.extraNeeded} créditos extras.`
        })

        return
      }

      setPendingAlvaras([])
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