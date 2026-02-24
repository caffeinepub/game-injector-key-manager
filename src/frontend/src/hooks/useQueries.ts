import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { LoginKey, KeyId, Injector, InjectorId } from "../backend";

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
      injectorId,
    }: {
      keyValue: string;
      expiresInSeconds: bigint;
      injectorId: InjectorId | null;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.createKey(keyValue, expiresInSeconds, injectorId);
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

// Injector queries and mutations
export function useGetAllInjectors() {
  const { actor, isFetching } = useActor();
  return useQuery<Injector[]>({
    queryKey: ["injectors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInjectors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateInjector() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      redirectUrl,
    }: {
      name: string;
      redirectUrl: string | null;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.createInjector(name, redirectUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["injectors"] });
    },
  });
}

export function useDeleteInjector() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (injectorId: InjectorId) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.deleteInjector(injectorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["injectors"] });
    },
  });
}

export function useGenerateLoginRedirectUrl() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (injectorId: InjectorId) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.generateLoginRedirectUrl(injectorId);
    },
  });
}
