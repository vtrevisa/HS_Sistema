import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface Cities {
 id: number
 nome: string
}

export function useCities() {
 return useQuery<Cities[]>({
  queryKey: ['cidades-sp'],
  queryFn: async () => {
   const { data } = await axios.get<Cities[]>(
    'https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios'
   )
   return data
  },
  staleTime: 1000 * 60 * 60 * 24 // 24h (cidades quase nunca mudam)
 })
}