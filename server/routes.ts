import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { type PatientProfile, type AnalysisResult, type FoodItem, type RecommendedFood } from "@shared/schema";

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
      return res.status(404).json({ message: "음식을 찾을 수 없습니다" });
    }
    res.json(food);
  });

  // --- Core Analysis Logic ---
  app.post(api.analysis.analyze.path, async (req, res) => {
    try {
      const input = api.analysis.analyze.input.parse(req.body);
      const food = await storage.getFood(input.foodId);

      if (!food) {
        return res.status(404).json({ message: "분석할 음식을 찾을 수 없습니다" });
      }

      // 모든 음식 가져오기 (추천용)
      const allFoods = await storage.getAllFoods();
      const result = analyzeFood(input.profile, food, allFoods);
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

// --- Quick safety check for a food ---
function quickAnalyze(profile: PatientProfile, food: FoodItem): "Safe" | "Caution" | "Limit" {
  // 1순위: 칼륨
  if (profile.ckdStage >= 3 && food.potassiumMg > 350) return "Limit";
  if (profile.ckdStage >= 3 && food.potassiumMg > 200 && profile.serumPotassium && profile.serumPotassium >= 5.0) return "Limit";
  
  // 2순위: 인
  if (profile.ckdStage >= 4 && food.phosphorusMg > 300) return "Limit";
  
  // 4순위: 나트륨
  if (food.sodiumMg > 800) return "Limit";
  
  // 3순위: 당질 (Caution only)
  if (profile.hasDm) {
    const uncontrolledDm = profile.hba1c && profile.hba1c >= 8.0;
    if (uncontrolledDm && food.giIndex >= 70) return "Caution";
    if (food.sugarG >= 15) return "Caution";
  }
  
  // 나트륨 Caution
  if (food.sodiumMg > 400 && profile.ckdStage >= 3) return "Caution";
  
  return "Safe";
}

// --- Get recommendations (similar safe foods) ---
function getRecommendations(profile: PatientProfile, currentFood: FoodItem, allFoods: FoodItem[]): RecommendedFood[] {
  const recommendations: RecommendedFood[] = [];
  
  for (const food of allFoods) {
    if (food.id === currentFood.id) continue; // 현재 음식 제외
    
    const status = quickAnalyze(profile, food);
    if (status === "Safe") {
      let reason = "";
      
      // 같은 카테고리면 우선
      if (food.category === currentFood.category) {
        reason = `같은 ${food.category} 카테고리`;
      } else if (food.potassiumMg < 150) {
        reason = `저칼륨 (${food.potassiumMg}mg)`;
      } else if (food.giIndex < 50 && profile.hasDm) {
        reason = `저GI 식품 (${food.giIndex})`;
      } else {
        reason = `균형 잡힌 영양소`;
      }
      
      recommendations.push({
        id: food.id,
        foodName: food.foodName,
        category: food.category,
        reason
      });
      
      if (recommendations.length >= 5) break; // 최대 5개
    }
  }
  
  return recommendations;
}

// --- Get alternatives (safer substitutes) ---
function getAlternatives(profile: PatientProfile, currentFood: FoodItem, allFoods: FoodItem[]): RecommendedFood[] {
  const alternatives: RecommendedFood[] = [];
  const currentCategory = currentFood.category;
  
  // 같은 카테고리에서 안전한 대안 찾기
  const sameCategoryFoods = allFoods.filter(f => f.category === currentCategory && f.id !== currentFood.id);
  const otherFoods = allFoods.filter(f => f.category !== currentCategory && f.id !== currentFood.id);
  
  // 먼저 같은 카테고리에서 찾기
  for (const food of sameCategoryFoods) {
    const status = quickAnalyze(profile, food);
    if (status === "Safe" || status === "Caution") {
      let reason = "";
      
      if (food.potassiumMg < currentFood.potassiumMg) {
        reason = `칼륨 낮음 (${food.potassiumMg}mg vs ${currentFood.potassiumMg}mg)`;
      } else if (food.sodiumMg < currentFood.sodiumMg) {
        reason = `나트륨 낮음 (${food.sodiumMg}mg vs ${currentFood.sodiumMg}mg)`;
      } else if (food.giIndex < currentFood.giIndex && profile.hasDm) {
        reason = `GI 낮음 (${food.giIndex} vs ${currentFood.giIndex})`;
      } else {
        reason = `더 안전한 ${food.category}`;
      }
      
      alternatives.push({
        id: food.id,
        foodName: food.foodName,
        category: food.category,
        reason: status === "Safe" ? reason : `${reason} (주의 필요)`
      });
      
      if (alternatives.length >= 3) break;
    }
  }
  
  // 부족하면 다른 카테고리에서 추가
  if (alternatives.length < 5) {
    for (const food of otherFoods) {
      const status = quickAnalyze(profile, food);
      if (status === "Safe") {
        let reason = `${food.category}으로 대체 가능`;
        
        if (food.potassiumMg < 150) {
          reason = `저칼륨 대안 (${food.potassiumMg}mg)`;
        } else if (food.giIndex < 40 && profile.hasDm) {
          reason = `저GI 대안 (${food.giIndex})`;
        }
        
        alternatives.push({
          id: food.id,
          foodName: food.foodName,
          category: food.category,
          reason
        });
        
        if (alternatives.length >= 5) break;
      }
    }
  }
  
  return alternatives;
}

// --- Analysis Engine with Priority System ---
function analyzeFood(profile: PatientProfile, food: FoodItem, allFoods: FoodItem[]): AnalysisResult {
  const issues: string[] = [];
  
  type Verdict = "Safe" | "Caution" | "Limit";
  let potassiumVerdict: Verdict = "Safe";
  let phosphorusVerdict: Verdict = "Safe";
  let glucoseVerdict: Verdict = "Safe";
  let sodiumVerdict: Verdict = "Safe";

  // 1순위: 칼륨 (K)
  const isHighK = food.potassiumMg > 350;
  const isModerateK = food.potassiumMg > 200;
  
  if (profile.ckdStage >= 3) {
     if (isHighK) {
       potassiumVerdict = "Limit";
       issues.push(`칼륨 함량 높음 (${food.potassiumMg}mg): 신장에 부담이 됩니다.`);
     } else if (isModerateK && profile.serumPotassium && profile.serumPotassium >= 5.0) {
       potassiumVerdict = "Limit";
       issues.push(`중간 수준 칼륨이지만, 현재 혈청 칼륨 수치가 높습니다 (${profile.serumPotassium}).`);
     }
  }

  // 2순위: 인 (P)
  const isHighP = food.phosphorusMg > 300;
  
  if (profile.ckdStage >= 4 && isHighP) {
    phosphorusVerdict = "Limit";
    issues.push(`인 함량 높음 (${food.phosphorusMg}mg): ${profile.ckdStage}단계에서는 배출이 어렵습니다.`);
  }

  // 3순위: 당질 (GI/Sugar)
  if (profile.hasDm) {
    const isHighGI = food.giIndex >= 70;
    const isHighSugar = food.sugarG >= 15;
    const uncontrolledDm = profile.hba1c && profile.hba1c >= 8.0;

    if (uncontrolledDm && isHighGI) {
      glucoseVerdict = "Caution";
      issues.push(`혈당지수(GI) 높음 (${food.giIndex}): HbA1c가 높은 상태에서 혈당을 급격히 올릴 수 있습니다.`);
    }

    if (isHighSugar) {
       if (glucoseVerdict !== "Limit") glucoseVerdict = "Caution";
       issues.push(`당류 높음 (${food.sugarG}g): 섭취량에 주의하세요.`);
    }
  }

  // 4순위: 나트륨 (Na)
  if (food.sodiumMg > 800) {
    sodiumVerdict = "Limit";
    issues.push(`나트륨 매우 높음 (${food.sodiumMg}mg): 혈압 상승과 부종을 유발합니다.`);
  } else if (food.sodiumMg > 400 && profile.ckdStage >= 3) {
    sodiumVerdict = "Caution";
    issues.push(`나트륨 함량 주의 (${food.sodiumMg}mg): 적게 섭취하세요.`);
  }

  // 우선순위 기반 최종 판정
  let finalStatus: Verdict = "Safe";
  let primaryReason = "";

  if (potassiumVerdict === "Limit") {
    finalStatus = "Limit";
    primaryReason = "칼륨";
  } else if (potassiumVerdict === "Caution" && finalStatus !== "Limit") {
    finalStatus = "Caution";
    primaryReason = "칼륨";
  }

  if (finalStatus !== "Limit") {
    if (phosphorusVerdict === "Limit") {
      finalStatus = "Limit";
      primaryReason = "인";
    } else if (phosphorusVerdict === "Caution" && finalStatus !== "Limit") {
      finalStatus = "Caution";
      if (!primaryReason) primaryReason = "인";
    }
  }

  if (finalStatus !== "Limit") {
    if (glucoseVerdict === "Limit") {
      finalStatus = "Limit";
      primaryReason = "당질";
    } else if (glucoseVerdict === "Caution" && finalStatus !== "Limit") {
      finalStatus = "Caution";
      if (!primaryReason) primaryReason = "당질";
    }
  }

  if (finalStatus !== "Limit") {
    if (sodiumVerdict === "Limit") {
      finalStatus = "Limit";
      primaryReason = "나트륨";
    } else if (sodiumVerdict === "Caution" && finalStatus !== "Limit") {
      finalStatus = "Caution";
      if (!primaryReason) primaryReason = "나트륨";
    }
  }

  // 교육용 메시지 생성
  let message = "";
  const foodName = food.foodName;

  if (finalStatus === "Safe") {
    message = `${foodName}은(는) 현재 상태에서 안전하게 섭취할 수 있습니다. 영양 가이드라인에 적합합니다.`;
  } else if (finalStatus === "Caution") {
    message = `${foodName}은(는) 섭취할 수 있지만, 양 조절이 중요합니다. ${issues[0] || "섭취량을 모니터링하세요."}`;
  } else {
    message = `${foodName}은(는) 권장하지 않습니다. ${issues[0] || "현재 건강 상태와 맞지 않습니다."}`;
  }

  message = `[영양사 의견] ${message}`;

  // 추천/대체 음식 생성
  let recommendations: RecommendedFood[] | undefined;
  let alternatives: RecommendedFood[] | undefined;

  if (finalStatus === "Safe") {
    recommendations = getRecommendations(profile, food, allFoods);
  } else if (finalStatus === "Limit") {
    alternatives = getAlternatives(profile, food, allFoods);
  }

  return {
    status: finalStatus,
    summary: finalStatus === "Safe" ? "섭취 가능" : (finalStatus === "Caution" ? "주의 필요" : "제한 / 피하세요"),
    details: issues,
    nutrientsOfInterest: {
      potassium: food.potassiumMg,
      phosphorus: food.phosphorusMg,
      sugar: food.sugarG,
      sodium: food.sodiumMg,
      gi: food.giIndex
    },
    educationalMessage: message,
    recommendations,
    alternatives
  };
}
