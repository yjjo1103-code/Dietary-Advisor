import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type FoodItem, type SavedProfile, type InsertSavedProfile, type AnalyzeRequest } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export function useFoods(searchQuery?: string) {
  return useQuery({
    queryKey: [api.foods.list.path, searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? buildUrl(api.foods.list.path) + `?q=${encodeURIComponent(searchQuery)}`
        : api.foods.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch foods");
      return api.foods.list.responses[200].parse(await res.json());
    },
  });
}

export async function fetchFoodById(id: number): Promise<FoodItem> {
  const url = buildUrl(api.foods.get.path, { id });
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch food");
  return res.json();
}

export function useAnalyzeFood() {
  return useMutation({
    mutationFn: async (data: AnalyzeRequest) => {
      const res = await fetch(api.analysis.analyze.path, {
        method: api.analysis.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.analysis.analyze.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) {
          throw new Error("Resource not found");
        }
        throw new Error("Analysis failed");
      }

      return api.analysis.analyze.responses[200].parse(await res.json());
    },
  });
}

// --- Profile Hooks ---
export function useSavedProfiles() {
  return useQuery({
    queryKey: [api.profiles.list.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profiles");
      return res.json() as Promise<SavedProfile[]>;
    },
  });
}

export function useCreateProfile() {
  return useMutation({
    mutationFn: async (data: InsertSavedProfile) => {
      const res = await fetch(api.profiles.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      return res.json() as Promise<SavedProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] });
    },
  });
}

export function useDeleteProfile() {
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.profiles.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete profile");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] });
    },
  });
}
