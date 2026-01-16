import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl, type AnalysisResponse, type AnalyzeRequest } from "@shared/routes";
import { type FoodItem } from "@shared/schema";

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
      // Validate input before sending using the shared schema if needed, 
      // but api.analysis.analyze.input handles it on server. 
      // Here we trust the type system.
      
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
