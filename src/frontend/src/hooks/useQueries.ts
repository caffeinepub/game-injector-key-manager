import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { LoginKey, KeyId } from "../backend";

export function useGetAllKeys() {
  const { actor, isFetching } = useActor();
  return useQuery<LoginKey[]>({
    queryKey: ["keys"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllKeys();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      keyValue,
      expiresInSeconds,
    }: {
      keyValue: string;
      expiresInSeconds: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.createKey(keyValue, expiresInSeconds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
    },
  });
}

export function useBlockKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: KeyId) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.blockKey(keyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
    },
  });
}

export function useUnblockKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: KeyId) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.unblockKey(keyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
    },
  });
}
