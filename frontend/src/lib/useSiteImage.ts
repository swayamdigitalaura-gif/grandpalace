import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/admin-api";

type SiteImage = { key: string; label: string; url: string };

export function useSiteImage(key: string, fallback: string): string {
  const { data } = useQuery({
    queryKey: ["site-images"],
    queryFn: () => api.get<SiteImage[]>("/api/site-images"),
    staleTime: 60_000,
  });
  return data?.find((img) => img.key === key)?.url || fallback;
}
