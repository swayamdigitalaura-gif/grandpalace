import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/admin-api";

type SiteToggleData = { key: string; label: string; active: boolean };

export function useSiteToggle(key: string): boolean {
  const { data } = useQuery({
    queryKey: ["site-toggles"],
    queryFn: () => api.get<SiteToggleData[]>("/api/site-toggles"),
    staleTime: 60_000,
  });
  const toggle = data?.find((t) => t.key === key);
  return toggle ? toggle.active : true; // default to active if no row exists yet
}
