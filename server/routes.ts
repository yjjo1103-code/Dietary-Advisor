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

// --- Analysis Engine with Priority System ---
// 우선순위: 1. 칼륨(K) > 2. 인(P) > 3. 당질(GI/Sugar) > 4. 나트륨(Na)
function analyzeFood(profile: PatientProfile, food: FoodItem): AnalysisResult {
  const issues: string[] = [];
  
  // 각 우선순위별 판정 결과 저장
  type Verdict = "Safe" | "Caution" | "Limit";
  let potassiumVerdict: Verdict = "Safe";
  let phosphorusVerdict: Verdict = "Safe";
  let glucoseVerdict: Verdict = "Safe";
  let sodiumVerdict: Verdict = "Safe";

  // ========================================
  // 1순위: 칼륨 (K) 체크
  // 규칙: CKD 3b 이상 (Stage >= 3) + 칼륨 350mg 초과 → "제한"
  // ========================================
  const isHighK = food.potassiumMg > 350;
  const isModerateK = food.potassiumMg > 200;
  
  if (profile.ckdStage >= 3) { // CKD 3b 이상 (3, 4, 5 단계)
     if (isHighK) {
       potassiumVerdict = "Limit";
       issues.push(`칼륨 함량 높음 (${food.potassiumMg}mg): 신장에 부담이 됩니다.`);
     } else if (isModerateK && profile.serumPotassium && profile.serumPotassium >= 5.0) {
       potassiumVerdict = "Limit";
       issues.push(`중간 수준 칼륨이지만, 현재 혈청 칼륨 수치가 높습니다 (${profile.serumPotassium}).`);
     }
  }

  // ========================================
  // 2순위: 인 (P) 체크
  // 규칙: CKD 4-5 + 인 300mg 초과 → "제한"
  // ========================================
  const isHighP = food.phosphorusMg > 300;
  
  if (profile.ckdStage >= 4 && isHighP) {
    phosphorusVerdict = "Limit";
    issues.push(`인 함량 높음 (${food.phosphorusMg}mg): ${profile.ckdStage}단계에서는 배출이 어렵습니다.`);
  }

  // ========================================
  // 3순위: 당질 (GI/Sugar) 체크
  // 규칙: HbA1c >= 8.0 + GI >= 70 → "주의"
  // ========================================
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

  // ========================================
  // 4순위: 나트륨 (Na) 체크
  // ========================================
  if (food.sodiumMg > 800) {
    sodiumVerdict = "Limit";
    issues.push(`나트륨 매우 높음 (${food.sodiumMg}mg): 혈압 상승과 부종을 유발합니다.`);
  } else if (food.sodiumMg > 400 && profile.ckdStage >= 3) {
    sodiumVerdict = "Caution";
    issues.push(`나트륨 함량 주의 (${food.sodiumMg}mg): 적게 섭취하세요.`);
  }

  // ========================================
  // 우선순위 기반 최종 판정
  // 상위 우선순위에서 "제한"이면 최종 결과는 제한
  // ========================================
  let finalStatus: Verdict = "Safe";
  let primaryReason = "";

  // 1순위: 칼륨
  if (potassiumVerdict === "Limit") {
    finalStatus = "Limit";
    primaryReason = "칼륨";
  } else if (potassiumVerdict === "Caution" && finalStatus !== "Limit") {
    finalStatus = "Caution";
    primaryReason = "칼륨";
  }

  // 2순위: 인 (칼륨이 Limit이 아닌 경우에만 승격 가능)
  if (finalStatus !== "Limit") {
    if (phosphorusVerdict === "Limit") {
      finalStatus = "Limit";
      primaryReason = "인";
    } else if (phosphorusVerdict === "Caution" && finalStatus !== "Limit") {
      finalStatus = "Caution";
      if (!primaryReason) primaryReason = "인";
    }
  }

  // 3순위: 당질 (상위 우선순위가 Limit이 아닌 경우에만 승격 가능)
  if (finalStatus !== "Limit") {
    if (glucoseVerdict === "Limit") {
      finalStatus = "Limit";
      primaryReason = "당질";
    } else if (glucoseVerdict === "Caution" && finalStatus !== "Limit") {
      finalStatus = "Caution";
      if (!primaryReason) primaryReason = "당질";
    }
  }

  // 4순위: 나트륨 (상위 우선순위가 Limit이 아닌 경우에만 승격 가능)
  if (finalStatus !== "Limit") {
    if (sodiumVerdict === "Limit") {
      finalStatus = "Limit";
      primaryReason = "나트륨";
    } else if (sodiumVerdict === "Caution" && finalStatus !== "Limit") {
      finalStatus = "Caution";
      if (!primaryReason) primaryReason = "나트륨";
    }
  }

  // ========================================
  // 교육용 메시지 생성
  // ========================================
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
    educationalMessage: message
  };
}
