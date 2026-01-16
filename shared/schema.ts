import { pgTable, text, serial, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
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

// --- Saved Patient Profile Schema (stored in DB) ---
export const savedProfiles = pgTable("saved_profiles", {
  id: serial("id").primaryKey(),
  profileName: text("profile_name").notNull(),
  gender: text("gender").notNull(),
  age: integer("age").notNull(),
  heightCm: real("height_cm").notNull(),
  weightKg: real("weight_kg").notNull(),
  hasDm: integer("has_dm").notNull(), // 0 or 1 for boolean
  ckdStage: integer("ckd_stage").notNull(),
  eGFR: real("egfr"),
  serumPotassium: real("serum_potassium"),
  hba1c: real("hba1c"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavedProfileSchema = createInsertSchema(savedProfiles).omit({ id: true, createdAt: true });
export type SavedProfile = typeof savedProfiles.$inferSelect;
export type InsertSavedProfile = z.infer<typeof insertSavedProfileSchema>;

// --- Recommended Food Schema ---
export const recommendedFoodSchema = z.object({
  id: z.number(),
  foodName: z.string(),
  category: z.string(),
  reason: z.string(),
});

export type RecommendedFood = z.infer<typeof recommendedFoodSchema>;

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
  recommendations: z.array(recommendedFoodSchema).optional(), // 추천 음식 (Safe 일 때)
  alternatives: z.array(recommendedFoodSchema).optional(), // 대체 음식 (Limit 일 때)
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

// Input for the analyze endpoint
export const analyzeRequestSchema = z.object({
  foodId: z.number(),
  profile: patientProfileSchema,
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
