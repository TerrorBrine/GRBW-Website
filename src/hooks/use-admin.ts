import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminStatus } from "@/lib/admin.functions";

export function useAdmin() {
  const fetchStatus = useServerFn(getAdminStatus);
  const { data } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => fetchStatus(),
    staleTime: 30_000,
  });
  return data?.admin === true;
}
