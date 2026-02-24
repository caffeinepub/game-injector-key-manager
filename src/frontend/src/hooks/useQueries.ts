import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { LoginKey, KeyId, Injector, InjectorId, Reseller, ResellerId } from "../backend";

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
      maxDevices,
    }: {
      keyValue: string;
      expiresInSeconds: bigint;
      injectorId: InjectorId | null;
      maxDevices?: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      
      const expires = expiresInSeconds === BigInt(0) ? undefined : 
        BigInt(Date.now() * 1_000_000) + (expiresInSeconds * BigInt(1_000_000_000));
      
      await actor.adminCreateKey({
        key: keyValue,
        injector: injectorId ?? undefined,
        expires,
        maxDevices,
      });
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
      try {
        await actor.createInjector(name, redirectUrl);
      } catch (err: any) {
        // Check if it's an authentication error
        if (err?.message?.includes("AUTHENTICATION_FAILED") || err?.message?.includes("authentication")) {
          throw new Error("Authentication expired. Please log out and log in again.");
        }
        throw err;
      }
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

// Authentication
export function useBackendAuthenticate() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      const result = await actor.authenticate(username, password);
      if (!result) {
        throw new Error("Backend authentication failed");
      }
      return result;
    },
  });
}

// Panel settings
export function useGetPanelSettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["panelSettings"],
    queryFn: async () => {
      if (!actor) return { panelName: "Game Injector", themePreset: "default" };
      return actor.getPanelSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdatePanelSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      panelName,
      themePreset,
    }: {
      panelName: string;
      themePreset: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      try {
        await actor.updatePanelSettings({ panelName, themePreset });
      } catch (err: any) {
        if (err?.message?.includes("AUTHENTICATION_FAILED") || err?.message?.includes("authentication")) {
          throw new Error("Authentication expired. Please log out and log in again.");
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panelSettings"] });
    },
  });
}

// Reseller authentication
export function useResellerAuthenticate() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      try {
        const resellerId = await actor.authenticateReseller(username, password);
        return resellerId;
      } catch (err: any) {
        throw new Error("Invalid username or password");
      }
    },
  });
}

// Reseller management (admin only)
export function useGetAllResellers() {
  const { actor, isFetching } = useActor();
  return useQuery<Reseller[]>({
    queryKey: ["resellers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllResellers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateReseller() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      password,
      initialCredits,
    }: {
      username: string;
      password: string;
      initialCredits: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      
      // Create reseller
      await actor.createReseller(username, password);
      
      // If initial credits > 0, add them
      if (initialCredits > BigInt(0)) {
        // Get the newly created reseller to get their ID
        const resellers = await actor.getAllResellers();
        const newReseller = resellers.find((r) => r.username === username);
        if (newReseller) {
          await actor.addCredits(newReseller.id, initialCredits);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
    },
  });
}

export function useDeleteReseller() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resellerId: ResellerId) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.deleteReseller(resellerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
    },
  });
}

export function useAddCredits() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resellerId,
      amount,
    }: {
      resellerId: ResellerId;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.addCredits(resellerId, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
      queryClient.invalidateQueries({ queryKey: ["reseller"] });
    },
  });
}

// Key credit cost
export function useGetKeyCreditCost() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["keyCreditCost"],
    queryFn: async () => {
      if (!actor) return BigInt(1);
      return actor.getKeyCreditCost();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetKeyCreditCost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cost: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.setKeyCreditCost(cost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keyCreditCost"] });
    },
  });
}

// Reseller-specific queries
export function useGetResellerById(resellerId: ResellerId) {
  const { actor, isFetching } = useActor();
  return useQuery<Reseller | null>({
    queryKey: ["reseller", resellerId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      const resellers = await actor.getAllResellers();
      return resellers.find((r) => r.id === resellerId) || null;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Refresh every 5 seconds to show updated credits
  });
}

export function useGetKeysByReseller(resellerId: ResellerId) {
  const { actor, isFetching } = useActor();
  return useQuery<LoginKey[]>({
    queryKey: ["keys", "reseller", resellerId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getKeysByReseller(resellerId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useResellerCreateKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resellerId,
      keyValue,
      expiresInSeconds,
      injectorId,
      maxDevices,
    }: {
      resellerId: ResellerId;
      keyValue: string;
      expiresInSeconds: bigint;
      injectorId: InjectorId | null;
      maxDevices?: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      
      const expires = expiresInSeconds === BigInt(0) ? undefined : 
        BigInt(Date.now() * 1_000_000) + (expiresInSeconds * BigInt(1_000_000_000));
      
      await actor.resellerCreateKey({
        key: keyValue,
        injector: injectorId ?? undefined,
        expires,
        maxDevices,
        resellerId,
      }, resellerId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
      queryClient.invalidateQueries({ 
        queryKey: ["keys", "reseller", variables.resellerId.toString()] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["reseller", variables.resellerId.toString()] 
      });
    },
  });
}
