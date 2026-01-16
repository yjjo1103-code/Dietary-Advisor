import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { type PatientProfile, type AnalysisResult, type FoodItem } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Search Foods ---
  app.get(api.foods.list.path, async (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q : "";
    const foods = await storage.searchFoods(query);
    res.json(foods);
  });

  app.get(api.foods.get.path, async (req, res) => {
    const food = await storage.getFood(Number(req.params.id));
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    res.json(food);
  });

  // --- Core Analysis Logic ---
  app.post(api.analysis.analyze.path, async (req, res) => {
    try {
      const input = api.analysis.analyze.input.parse(req.body);
      const food = await storage.getFood(input.foodId);

      if (!food) {
        return res.status(404).json({ message: "Food not found for analysis" });
      }

      const result = analyzeFood(input.profile, food);
      res.json(result);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}

// --- Analysis Engine ---
function analyzeFood(profile: PatientProfile, food: FoodItem): AnalysisResult {
  const issues: string[] = [];
  let status: "Safe" | "Caution" | "Limit" = "Safe";
  
  // Weights (Simple scoring for tie-breaking if needed, but we use rule priority)
  // Priority: K (1) > P (2) > Sugar/GI (3) > Na (4)

  // 1. Potassium (K) Checks
  // Rule: CKD 3b+ (Stage 3.5 = 3b/4/5 => Stage >= 3 and eGFR < 45? 
  // Simplified: Let's assume user inputs integer stage. 
  // User input is 1-5. Let's treat Stage 3 as 3a/3b ambiguity, but strict rule says 3b+.
  // Let's assume if Stage >= 4, definitely strict. If Stage 3, moderate.
  // Rule provided: "CKD 3b+ + K > 350 -> Limit"
  
  const isHighK = food.potassiumMg > 350;
  const isModerateK = food.potassiumMg > 200;
  
  if (profile.ckdStage >= 3) { // Covering 3b, 4, 5 loosely as "Advanced CKD"
     if (isHighK) {
       status = "Limit";
       issues.push(`High Potassium (${food.potassiumMg}mg): Dangerous for your kidneys.`);
     } else if (isModerateK && profile.serumPotassium && profile.serumPotassium >= 5.0) {
       // Context aware: if serum K is already high
       status = "Limit";
       issues.push(`Moderate Potassium, but your blood potassium is high (${profile.serumPotassium}).`);
     }
  }

  // 2. Phosphorus (P) Checks
  // Rule: CKD 4-5 + P > 300 -> Limit
  const isHighP = food.phosphorusMg > 300;
  
  if (profile.ckdStage >= 4 && isHighP) {
    status = "Limit";
    issues.push(`High Phosphorus (${food.phosphorusMg}mg): Hard to filter at Stage ${profile.ckdStage}.`);
  }

  // 3. Diabetes Checks (HbA1c & GI)
  // Rule: HbA1c >= 8.0 + GI >= 70 -> Caution
  if (profile.hasDm) {
    const isHighGI = food.giIndex >= 70;
    const isHighSugar = food.sugarG >= 15;
    const uncontrolledDm = profile.hba1c && profile.hba1c >= 8.0;

    if (uncontrolledDm && isHighGI) {
      // If not already limited by Kidney rules
      if (status !== "Limit") status = "Caution";
      issues.push(`High GI (${food.giIndex}): May spike blood sugar (HbA1c is high).`);
    }

    if (isHighSugar) {
       // Warning for sugar regardless of HbA1c
       if (status !== "Limit") status = "Caution";
       issues.push(`High Sugar (${food.sugarG}g): Watch your intake.`);
    }
  }

  // 4. Sodium Checks (General CKD rule)
  // CKD patients usually need < 2000mg Na/day.
  // If a single food has > 800mg (Ramyeon), it's a huge chunk.
  if (food.sodiumMg > 800) {
    status = "Limit";
    issues.push(`Very High Sodium (${food.sodiumMg}mg): Increases blood pressure and fluid retention.`);
  } else if (food.sodiumMg > 400 && profile.ckdStage >= 3) {
    if (status !== "Limit") status = "Caution";
    issues.push(`Significant Sodium (${food.sodiumMg}mg): Use sparingly.`);
  }

  // Generate Educational Message
  let message = "";
  const foodName = food.foodName;

  if (status === "Safe") {
    message = `${foodName} appears to be a safe choice for your current condition. It fits within your nutritional guidelines.`;
  } else if (status === "Caution") {
    message = `${foodName} can be eaten, but portion control is key. ${issues[0] || "Monitor your intake."}`;
  } else {
    message = `${foodName} is not recommended. ${issues[0] || "It conflicts with your health goals."}`;
  }

  // Nurse Tone Polish
  message = `[Nutritionist Note] ${message}`;

  return {
    status,
    summary: status === "Safe" ? "Safe to Eat" : (status === "Caution" ? "Eat with Caution" : "Avoid / Limit"),
    details: issues,
    nutrientsOfInterest: {
      potassium: food.potassiumMg,
      phosphorus: food.phosphorusMg,
      sugar: food.sugarG,
      sodium: food.sodiumMg,
      gi: food.giIndex
    },
    educationalMessage: message
  };
}
