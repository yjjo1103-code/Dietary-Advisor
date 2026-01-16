import { pgTable, text, serial, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Food Master Data Schema (Read-only for this PoC) ---
export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  foodName: text("food_name").notNull(),
  category: text("category").notNull(), // 'Grain', 'Vegetable', 'Fruit', 'Protein', 'Processed/Other'
  energyKcal: real("energy_kcal").notNull(),
  carbohydrateG: real("carbohydrate_g").notNull(),
  sugarG: real("sugar_g").notNull(),
  proteinG: real("protein_g").notNull(),
  fatG: real("fat_g").notNull(),
  sodiumMg: real("sodium_mg").notNull(),
  potassiumMg: real("potassium_mg").notNull(),
  phosphorusMg: real("phosphorus_mg").notNull(),
  giIndex: integer("gi_index").notNull(),
  note: text("note").default(""),
});

export const insertFoodSchema = createInsertSchema(foods);
export type FoodItem = typeof foods.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;

// --- Patient Profile Schema (Input for Analysis) ---
// Not stored in DB, but used for API validation
export const patientProfileSchema = z.object({
  gender: z.enum(["Male", "Female"]),
  age: z.coerce.number().min(1).max(120),
  heightCm: z.coerce.number().min(50).max(300),
  weightKg: z.coerce.number().min(20).max(300),
  // Disease status
  hasDm: z.boolean(),
  ckdStage: z.coerce.number().min(1).max(5), // 1 to 5
  // Clinical values
  eGFR: z.coerce.number().optional(),
  serumPotassium: z.coerce.number().optional(), // K
  hba1c: z.coerce.number().optional(),
});

export type PatientProfile = z.infer<typeof patientProfileSchema>;

// --- Analysis Result Schema ---
export const analysisResultSchema = z.object({
  status: z.enum(["Safe", "Caution", "Limit"]),
  summary: z.string(), // "Safety: Caution"
  details: z.array(z.string()), // Detailed reasons ["High Potassium...", "High GI..."]
  nutrientsOfInterest: z.object({
    potassium: z.number(),
    phosphorus: z.number(),
    sugar: z.number(),
    sodium: z.number(),
    gi: z.number(),
  }),
  educationalMessage: z.string(), // Nurse-like tone explanation
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

// Input for the analyze endpoint
export const analyzeRequestSchema = z.object({
  foodId: z.number(),
  profile: patientProfileSchema,
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
