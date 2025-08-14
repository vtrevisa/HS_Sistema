import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  return useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me', { withCredentials: true });
      return response.data.user;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

