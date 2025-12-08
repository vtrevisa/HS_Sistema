import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  return useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.user;

      // return {
      //   id: user.id,
      //   name: user.name,
      //   planId: user.plan_id,
      //   creditsLimit: user.credits,
      //   alvarasUsed: user.monthly_used,
      //   nextBillingDate: user.plan_renews_at,
      //   lastRenewalDate: user.last_renewal_at,
      //   subscription: {
      //     planId: user.plan_id,
      //     planName: user.plan.name,
      //     creditsLimit: user.plan.monthly_credits,
      //     alvarasUsed: user.monthly_used,
      //     nextBillingDate: user.plan_renews_at,
      //   }
      // };
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

