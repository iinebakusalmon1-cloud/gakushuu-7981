import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useGateSession() {
  return useQuery(orpc.gate.session.queryOptions({
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  }));
}

export function useVerifyGate() {
  return useMutation(orpc.gate.verify.mutationOptions());
}