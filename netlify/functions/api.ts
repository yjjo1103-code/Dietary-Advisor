import express, { type Request, type Response } from "express";
import serverless from "serverless-http";
import { z } from "zod";

const app = express();
app.use(express.json());

interface FoodItem {
  id: number;
  foodName: string;
  category: string;
  energyKcal: number;
  carbohydrateG: number;
  sugarG: number;
  proteinG: number;
  fatG: number;
  sodiumMg: number;
  potassiumMg: number;
  phosphorusMg: number;
  giIndex: number;
  note: string | null;
}

interface PatientProfile {
  ckdStage: number;
  hasDm: boolean;
  hba1c?: number;
  eGFR?: number;
  serumPotassium?: number;
}

interface RecommendedFood {
  id: number;
  foodName: string;
  category: string;
  reason: string;
}

interface AnalysisResult {
  foodName: string;
  status: "Safe" | "Caution" | "Limit";
  summary: string;
  details: string[];
  nutrientsOfInterest: {
    potassium: number;
    phosphorus: number;
    sugar: number;
    sodium: number;
    gi: number;
  };
  educationalMessage: string;
  recommendations?: RecommendedFood[];
  alternatives?: RecommendedFood[];
}

interface SavedProfile {
  id: number;
  name: string;
  ckdStage: number;
  hasDm: boolean;
  hba1c: number | null;
  eGFR: number | null;
  serumPotassium: number | null;
  createdAt: Date;
}

const patientProfileSchema = z.object({
  ckdStage: z.number().min(1).max(5),
  hasDm: z.boolean(),
  hba1c: z.number().optional(),
  eGFR: z.number().optional(),
  serumPotassium: z.number().optional(),
});

const analyzeInputSchema = z.object({
  foodId: z.number(),
  profile: patientProfileSchema,
});

const createProfileSchema = z.object({
  name: z.string().min(1),
  ckdStage: z.number().min(1).max(5),
  hasDm: z.boolean(),
  hba1c: z.number().nullable().optional(),
  eGFR: z.number().nullable().optional(),
  serumPotassium: z.number().nullable().optional(),
});

const initialFoods: Omit<FoodItem, "id">[] = [
  { foodName: "흰쌀밥", category: "곡류", energyKcal: 130, carbohydrateG: 28, sugarG: 0.1, proteinG: 2.7, fatG: 0.3, sodiumMg: 1, potassiumMg: 35, phosphorusMg: 43, giIndex: 73, note: "" },
  { foodName: "현미밥", category: "곡류", energyKcal: 110, carbohydrateG: 23, sugarG: 0.4, proteinG: 2.6, fatG: 0.9, sodiumMg: 2, potassiumMg: 84, phosphorusMg: 102, giIndex: 68, note: "인 함량 높음" },
  { foodName: "잡곡빵", category: "곡류", energyKcal: 265, carbohydrateG: 43, sugarG: 6, proteinG: 13, fatG: 4, sodiumMg: 400, potassiumMg: 230, phosphorusMg: 180, giIndex: 55, note: "나트륨, 인 주의" },
  { foodName: "고구마 (찐 것)", category: "곡류", energyKcal: 128, carbohydrateG: 30, sugarG: 6, proteinG: 1.5, fatG: 0.2, sodiumMg: 10, potassiumMg: 380, phosphorusMg: 50, giIndex: 61, note: "칼륨 높음!" },
  { foodName: "감자 (삶은 것)", category: "곡류", energyKcal: 77, carbohydrateG: 17, sugarG: 0.8, proteinG: 2, fatG: 0.1, sodiumMg: 6, potassiumMg: 421, phosphorusMg: 57, giIndex: 78, note: "칼륨 매우 높음" },
  { foodName: "시금치 (생것)", category: "채소", energyKcal: 23, carbohydrateG: 3.6, sugarG: 0.4, proteinG: 2.9, fatG: 0.4, sodiumMg: 79, potassiumMg: 558, phosphorusMg: 49, giIndex: 15, note: "칼륨 극도 주의" },
  { foodName: "오이", category: "채소", energyKcal: 15, carbohydrateG: 3.6, sugarG: 1.7, proteinG: 0.7, fatG: 0.1, sodiumMg: 2, potassiumMg: 147, phosphorusMg: 24, giIndex: 15, note: "저칼륨 좋은 선택" },
  { foodName: "당근 (생것)", category: "채소", energyKcal: 41, carbohydrateG: 10, sugarG: 4.7, proteinG: 0.9, fatG: 0.2, sodiumMg: 69, potassiumMg: 320, phosphorusMg: 35, giIndex: 35, note: "중간 칼륨" },
  { foodName: "양배추 (삶은 것)", category: "채소", energyKcal: 23, carbohydrateG: 5.5, sugarG: 2.8, proteinG: 1.3, fatG: 0.1, sodiumMg: 10, potassiumMg: 150, phosphorusMg: 25, giIndex: 15, note: "데치면 칼륨 감소" },
  { foodName: "토마토", category: "채소", energyKcal: 18, carbohydrateG: 3.9, sugarG: 2.6, proteinG: 0.9, fatG: 0.2, sodiumMg: 5, potassiumMg: 237, phosphorusMg: 24, giIndex: 15, note: "중간-높은 칼륨" },
  { foodName: "브로콜리 (삶은 것)", category: "채소", energyKcal: 35, carbohydrateG: 7.2, sugarG: 1.4, proteinG: 2.4, fatG: 0.4, sodiumMg: 41, potassiumMg: 293, phosphorusMg: 66, giIndex: 15, note: "" },
  { foodName: "상추", category: "채소", energyKcal: 15, carbohydrateG: 2.9, sugarG: 0.8, proteinG: 1.4, fatG: 0.2, sodiumMg: 28, potassiumMg: 194, phosphorusMg: 29, giIndex: 15, note: "" },
  { foodName: "표고버섯", category: "채소", energyKcal: 34, carbohydrateG: 6.8, sugarG: 2.4, proteinG: 2.2, fatG: 0.5, sodiumMg: 9, potassiumMg: 304, phosphorusMg: 112, giIndex: 15, note: "인/칼륨 높음" },
  { foodName: "바나나", category: "과일", energyKcal: 89, carbohydrateG: 23, sugarG: 12, proteinG: 1.1, fatG: 0.3, sodiumMg: 1, potassiumMg: 358, phosphorusMg: 22, giIndex: 51, note: "칼륨 높음" },
  { foodName: "사과 (껍질 포함)", category: "과일", energyKcal: 52, carbohydrateG: 14, sugarG: 10, proteinG: 0.3, fatG: 0.2, sodiumMg: 1, potassiumMg: 107, phosphorusMg: 11, giIndex: 36, note: "저칼륨 선택" },
  { foodName: "포도", category: "과일", energyKcal: 69, carbohydrateG: 18, sugarG: 15, proteinG: 0.7, fatG: 0.2, sodiumMg: 2, potassiumMg: 191, phosphorusMg: 20, giIndex: 59, note: "" },
  { foodName: "수박", category: "과일", energyKcal: 30, carbohydrateG: 8, sugarG: 6, proteinG: 0.6, fatG: 0.2, sodiumMg: 1, potassiumMg: 112, phosphorusMg: 11, giIndex: 72, note: "GI 높지만 칼륨 부담 적음" },
  { foodName: "오렌지", category: "과일", energyKcal: 47, carbohydrateG: 12, sugarG: 9, proteinG: 0.9, fatG: 0.1, sodiumMg: 0, potassiumMg: 181, phosphorusMg: 14, giIndex: 43, note: "중간 칼륨" },
  { foodName: "딸기", category: "과일", energyKcal: 32, carbohydrateG: 7.7, sugarG: 4.9, proteinG: 0.7, fatG: 0.3, sodiumMg: 1, potassiumMg: 153, phosphorusMg: 24, giIndex: 40, note: "저GI, 저칼륨" },
  { foodName: "키위", category: "과일", energyKcal: 61, carbohydrateG: 15, sugarG: 9, proteinG: 1.1, fatG: 0.5, sodiumMg: 3, potassiumMg: 312, phosphorusMg: 34, giIndex: 50, note: "칼륨 높음" },
  { foodName: "닭가슴살 (삶은 것)", category: "단백질", energyKcal: 165, carbohydrateG: 0, sugarG: 0, proteinG: 31, fatG: 3.6, sodiumMg: 74, potassiumMg: 256, phosphorusMg: 228, giIndex: 0, note: "인 함량 높은 공급원" },
  { foodName: "삼겹살 (구운 것)", category: "단백질", energyKcal: 518, carbohydrateG: 0, sugarG: 0, proteinG: 9, fatG: 53, sodiumMg: 32, potassiumMg: 185, phosphorusMg: 130, giIndex: 0, note: "지방 높음" },
  { foodName: "두부", category: "단백질", energyKcal: 76, carbohydrateG: 1.9, sugarG: 0.6, proteinG: 8, fatG: 4.8, sodiumMg: 7, potassiumMg: 121, phosphorusMg: 97, giIndex: 15, note: "식물성 단백질 - 일반적으로 안전" },
  { foodName: "계란 (삶은 것)", category: "단백질", energyKcal: 155, carbohydrateG: 1.1, sugarG: 1.1, proteinG: 13, fatG: 11, sodiumMg: 124, potassiumMg: 126, phosphorusMg: 198, giIndex: 0, note: "노른자에 인 함유" },
  { foodName: "고등어 (구운 것)", category: "단백질", energyKcal: 205, carbohydrateG: 0, sugarG: 0, proteinG: 19, fatG: 14, sodiumMg: 90, potassiumMg: 314, phosphorusMg: 217, giIndex: 0, note: "오메가-3, 인/칼륨 주의" },
  { foodName: "소고기 (살코기)", category: "단백질", energyKcal: 250, carbohydrateG: 0, sugarG: 0, proteinG: 26, fatG: 15, sodiumMg: 72, potassiumMg: 318, phosphorusMg: 215, giIndex: 0, note: "인 함량 높음" },
  { foodName: "저지방 우유", category: "단백질", energyKcal: 42, carbohydrateG: 5, sugarG: 5, proteinG: 3.4, fatG: 1, sodiumMg: 44, potassiumMg: 150, phosphorusMg: 93, giIndex: 27, note: "액체 인 공급원" },
  { foodName: "라면", category: "가공식품", energyKcal: 450, carbohydrateG: 65, sugarG: 4, proteinG: 10, fatG: 17, sodiumMg: 1700, potassiumMg: 150, phosphorusMg: 120, giIndex: 73, note: "극심한 나트륨 경고" },
  { foodName: "콜라", category: "가공식품", energyKcal: 38, carbohydrateG: 10.6, sugarG: 10.6, proteinG: 0, fatG: 0, sodiumMg: 4, potassiumMg: 0, phosphorusMg: 15, giIndex: 60, note: "고당류, 인 첨가물" },
  { foodName: "감자칩", category: "가공식품", energyKcal: 536, carbohydrateG: 53, sugarG: 0.2, proteinG: 7, fatG: 35, sodiumMg: 525, potassiumMg: 1275, phosphorusMg: 164, giIndex: 70, note: "칼륨 & 나트륨 매우 높음" },
];

const foods: FoodItem[] = initialFoods.map((food, index) => ({
  ...food,
  id: index + 1,
}));

let profiles: SavedProfile[] = [];
let profileIdCounter = 1;

function quickAnalyze(profile: PatientProfile, food: FoodItem): "Safe" | "Caution" | "Limit" {
  if (profile.ckdStage >= 3 && food.potassiumMg > 350) return "Limit";
  if (profile.ckdStage >= 3 && food.potassiumMg > 200 && profile.serumPotassium && profile.serumPotassium >= 5.0) return "Limit";
  if (profile.ckdStage >= 4 && food.phosphorusMg > 300) return "Limit";
  if (food.sodiumMg > 800) return "Limit";
  if (profile.hasDm) {
    const uncontrolledDm = profile.hba1c && profile.hba1c >= 8.0;
    if (uncontrolledDm && food.giIndex >= 70) return "Caution";
    if (food.sugarG >= 15) return "Caution";
  }
  if (food.sodiumMg > 400 && profile.ckdStage >= 3) return "Caution";
  return "Safe";
}

function getRecommendations(profile: PatientProfile, currentFood: FoodItem): RecommendedFood[] {
  const recommendations: RecommendedFood[] = [];
  for (const food of foods) {
    if (food.id === currentFood.id) continue;
    const status = quickAnalyze(profile, food);
    if (status === "Safe") {
      let reason = "";
      if (food.category === currentFood.category) {
        reason = `같은 ${food.category} 카테고리`;
      } else if (food.potassiumMg < 150) {
        reason = `저칼륨 (${food.potassiumMg}mg)`;
      } else if (food.giIndex < 50 && profile.hasDm) {
        reason = `저GI 식품 (${food.giIndex})`;
      } else {
        reason = `균형 잡힌 영양소`;
      }
      recommendations.push({ id: food.id, foodName: food.foodName, category: food.category, reason });
      if (recommendations.length >= 5) break;
    }
  }
  return recommendations;
}

function getAlternatives(profile: PatientProfile, currentFood: FoodItem): RecommendedFood[] {
  const alternatives: RecommendedFood[] = [];
  const sameCategoryFoods = foods.filter(f => f.category === currentFood.category && f.id !== currentFood.id);
  const otherFoods = foods.filter(f => f.category !== currentFood.category && f.id !== currentFood.id);
  
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
        alternatives.push({ id: food.id, foodName: food.foodName, category: food.category, reason });
        if (alternatives.length >= 5) break;
      }
    }
  }
  return alternatives;
}

function analyzeFood(profile: PatientProfile, food: FoodItem): AnalysisResult {
  const issues: string[] = [];
  type Verdict = "Safe" | "Caution" | "Limit";
  let potassiumVerdict: Verdict = "Safe";
  let phosphorusVerdict: Verdict = "Safe";
  let glucoseVerdict: Verdict = "Safe";
  let sodiumVerdict: Verdict = "Safe";

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

  const isHighP = food.phosphorusMg > 300;
  if (profile.ckdStage >= 4 && isHighP) {
    phosphorusVerdict = "Limit";
    issues.push(`인 함량 높음 (${food.phosphorusMg}mg): ${profile.ckdStage}단계에서는 배출이 어렵습니다.`);
  }

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

  if (food.sodiumMg > 800) {
    sodiumVerdict = "Limit";
    issues.push(`나트륨 매우 높음 (${food.sodiumMg}mg): 혈압 상승과 부종을 유발합니다.`);
  } else if (food.sodiumMg > 400 && profile.ckdStage >= 3) {
    sodiumVerdict = "Caution";
    issues.push(`나트륨 함량 주의 (${food.sodiumMg}mg): 적게 섭취하세요.`);
  }

  let finalStatus: Verdict = "Safe";
  let primaryReason = "";

  if (potassiumVerdict === "Limit") { finalStatus = "Limit"; primaryReason = "칼륨"; }
  else if (potassiumVerdict === "Caution" && finalStatus !== "Limit") { finalStatus = "Caution"; primaryReason = "칼륨"; }

  if (finalStatus !== "Limit") {
    if (phosphorusVerdict === "Limit") { finalStatus = "Limit"; primaryReason = "인"; }
    else if (phosphorusVerdict === "Caution" && finalStatus !== "Limit") { finalStatus = "Caution"; if (!primaryReason) primaryReason = "인"; }
  }

  if (finalStatus !== "Limit") {
    if (glucoseVerdict === "Limit") { finalStatus = "Limit"; primaryReason = "당질"; }
    else if (glucoseVerdict === "Caution" && finalStatus !== "Limit") { finalStatus = "Caution"; if (!primaryReason) primaryReason = "당질"; }
  }

  if (finalStatus !== "Limit") {
    if (sodiumVerdict === "Limit") { finalStatus = "Limit"; primaryReason = "나트륨"; }
    else if (sodiumVerdict === "Caution" && finalStatus !== "Limit") { finalStatus = "Caution"; if (!primaryReason) primaryReason = "나트륨"; }
  }

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

  let recommendations: RecommendedFood[] | undefined;
  let alternatives: RecommendedFood[] | undefined;
  if (finalStatus === "Safe") {
    recommendations = getRecommendations(profile, food);
  } else if (finalStatus === "Limit") {
    alternatives = getAlternatives(profile, food);
  }

  return {
    foodName: food.foodName,
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

app.get("/api/foods", (_req: Request, res: Response) => {
  const query = typeof _req.query.q === "string" ? _req.query.q.toLowerCase() : "";
  const result = query 
    ? foods.filter(f => f.foodName.toLowerCase().includes(query) || f.category.toLowerCase().includes(query))
    : foods;
  res.json(result);
});

app.get("/api/foods/:id", (req: Request, res: Response) => {
  const food = foods.find(f => f.id === Number(req.params.id));
  if (!food) return res.status(404).json({ message: "음식을 찾을 수 없습니다" });
  res.json(food);
});

app.post("/api/analyze", (req: Request, res: Response) => {
  try {
    const input = analyzeInputSchema.parse(req.body);
    const food = foods.find(f => f.id === input.foodId);
    if (!food) return res.status(404).json({ message: "분석할 음식을 찾을 수 없습니다" });
    const result = analyzeFood(input.profile, food);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
    }
    throw err;
  }
});

app.get("/api/profiles", (_req: Request, res: Response) => {
  res.json(profiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
});

app.post("/api/profiles", (req: Request, res: Response) => {
  try {
    const input = createProfileSchema.parse(req.body);
    const newProfile: SavedProfile = {
      id: profileIdCounter++,
      name: input.name,
      ckdStage: input.ckdStage,
      hasDm: input.hasDm,
      hba1c: input.hba1c ?? null,
      eGFR: input.eGFR ?? null,
      serumPotassium: input.serumPotassium ?? null,
      createdAt: new Date(),
    };
    profiles.push(newProfile);
    res.status(201).json(newProfile);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
    }
    throw err;
  }
});

app.delete("/api/profiles/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = profiles.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ message: "프로필을 찾을 수 없습니다" });
  profiles.splice(index, 1);
  res.json({ success: true });
});

export const handler = serverless(app);
