import { z } from "zod";
import { foods, savedProfiles, insertSavedProfileSchema, analyzeRequestSchema, analysisResultSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  foods: {
    list: {
      method: "GET" as const,
      path: "/api/foods",
      input: z.object({
        q: z.string().optional(), // Search query
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof foods.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/foods/:id",
      responses: {
        200: z.custom<typeof foods.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  analysis: {
    analyze: {
      method: "POST" as const,
      path: "/api/analyze",
      input: analyzeRequestSchema,
      responses: {
        200: analysisResultSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  profiles: {
    list: {
      method: "GET" as const,
      path: "/api/profiles",
      responses: {
        200: z.array(z.custom<typeof savedProfiles.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/profiles",
      input: insertSavedProfileSchema,
      responses: {
        201: z.custom<typeof savedProfiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/profiles/:id",
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type FoodListResponse = z.infer<typeof api.foods.list.responses[200]>;
export type AnalysisResponse = z.infer<typeof api.analysis.analyze.responses[200]>;
