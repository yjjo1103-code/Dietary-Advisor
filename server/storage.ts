import { type FoodItem, type InsertFood } from "@shared/schema";

export interface IStorage {
  searchFoods(query: string): Promise<FoodItem[]>;
  getFood(id: number): Promise<FoodItem | undefined>;
  createFood(food: InsertFood): Promise<FoodItem>;
}

export class MemStorage implements IStorage {
  private foods: Map<number, FoodItem>;
  private currentId: number;

  constructor() {
    this.foods = new Map();
    this.currentId = 1;
    this.initializeData();
  }

  async searchFoods(query: string): Promise<FoodItem[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.foods.values()).filter(
      (food) =>
        food.foodName.toLowerCase().includes(lowerQuery) ||
        food.category.toLowerCase().includes(lowerQuery)
    );
  }

  async getFood(id: number): Promise<FoodItem | undefined> {
    return this.foods.get(id);
  }

  async createFood(insertFood: InsertFood): Promise<FoodItem> {
    const id = this.currentId++;
    const food: FoodItem = { ...insertFood, id, note: insertFood.note || null };
    this.foods.set(id, food);
    return food;
  }

  private initializeData() {
    const initialFoods: InsertFood[] = [
      // 1. 곡류 (5개)
      { foodName: "흰쌀밥", category: "곡류", energyKcal: 130, carbohydrateG: 28, sugarG: 0.1, proteinG: 2.7, fatG: 0.3, sodiumMg: 1, potassiumMg: 35, phosphorusMg: 43, giIndex: 73, note: "" },
      { foodName: "현미밥", category: "곡류", energyKcal: 110, carbohydrateG: 23, sugarG: 0.4, proteinG: 2.6, fatG: 0.9, sodiumMg: 2, potassiumMg: 84, phosphorusMg: 102, giIndex: 68, note: "인 함량 높음" },
      { foodName: "잡곡빵", category: "곡류", energyKcal: 265, carbohydrateG: 43, sugarG: 6, proteinG: 13, fatG: 4, sodiumMg: 400, potassiumMg: 230, phosphorusMg: 180, giIndex: 55, note: "나트륨, 인 주의" },
      { foodName: "고구마 (찐 것)", category: "곡류", energyKcal: 128, carbohydrateG: 30, sugarG: 6, proteinG: 1.5, fatG: 0.2, sodiumMg: 10, potassiumMg: 380, phosphorusMg: 50, giIndex: 61, note: "칼륨 높음!" },
      { foodName: "감자 (삶은 것)", category: "곡류", energyKcal: 77, carbohydrateG: 17, sugarG: 0.8, proteinG: 2, fatG: 0.1, sodiumMg: 6, potassiumMg: 421, phosphorusMg: 57, giIndex: 78, note: "칼륨 매우 높음" },

      // 2. 채소류 (8개)
      { foodName: "시금치 (생것)", category: "채소", energyKcal: 23, carbohydrateG: 3.6, sugarG: 0.4, proteinG: 2.9, fatG: 0.4, sodiumMg: 79, potassiumMg: 558, phosphorusMg: 49, giIndex: 15, note: "칼륨 극도 주의" },
      { foodName: "오이", category: "채소", energyKcal: 15, carbohydrateG: 3.6, sugarG: 1.7, proteinG: 0.7, fatG: 0.1, sodiumMg: 2, potassiumMg: 147, phosphorusMg: 24, giIndex: 15, note: "저칼륨 좋은 선택" },
      { foodName: "당근 (생것)", category: "채소", energyKcal: 41, carbohydrateG: 10, sugarG: 4.7, proteinG: 0.9, fatG: 0.2, sodiumMg: 69, potassiumMg: 320, phosphorusMg: 35, giIndex: 35, note: "중간 칼륨" },
      { foodName: "양배추 (삶은 것)", category: "채소", energyKcal: 23, carbohydrateG: 5.5, sugarG: 2.8, proteinG: 1.3, fatG: 0.1, sodiumMg: 10, potassiumMg: 150, phosphorusMg: 25, giIndex: 15, note: "데치면 칼륨 감소" },
      { foodName: "토마토", category: "채소", energyKcal: 18, carbohydrateG: 3.9, sugarG: 2.6, proteinG: 0.9, fatG: 0.2, sodiumMg: 5, potassiumMg: 237, phosphorusMg: 24, giIndex: 15, note: "중간-높은 칼륨" },
      { foodName: "브로콜리 (삶은 것)", category: "채소", energyKcal: 35, carbohydrateG: 7.2, sugarG: 1.4, proteinG: 2.4, fatG: 0.4, sodiumMg: 41, potassiumMg: 293, phosphorusMg: 66, giIndex: 15, note: "" },
      { foodName: "상추", category: "채소", energyKcal: 15, carbohydrateG: 2.9, sugarG: 0.8, proteinG: 1.4, fatG: 0.2, sodiumMg: 28, potassiumMg: 194, phosphorusMg: 29, giIndex: 15, note: "" },
      { foodName: "표고버섯", category: "채소", energyKcal: 34, carbohydrateG: 6.8, sugarG: 2.4, proteinG: 2.2, fatG: 0.5, sodiumMg: 9, potassiumMg: 304, phosphorusMg: 112, giIndex: 15, note: "인/칼륨 높음" },

      // 3. 과일류 (7개)
      { foodName: "바나나", category: "과일", energyKcal: 89, carbohydrateG: 23, sugarG: 12, proteinG: 1.1, fatG: 0.3, sodiumMg: 1, potassiumMg: 358, phosphorusMg: 22, giIndex: 51, note: "칼륨 높음" },
      { foodName: "사과 (껍질 포함)", category: "과일", energyKcal: 52, carbohydrateG: 14, sugarG: 10, proteinG: 0.3, fatG: 0.2, sodiumMg: 1, potassiumMg: 107, phosphorusMg: 11, giIndex: 36, note: "저칼륨 선택" },
      { foodName: "포도", category: "과일", energyKcal: 69, carbohydrateG: 18, sugarG: 15, proteinG: 0.7, fatG: 0.2, sodiumMg: 2, potassiumMg: 191, phosphorusMg: 20, giIndex: 59, note: "" },
      { foodName: "수박", category: "과일", energyKcal: 30, carbohydrateG: 8, sugarG: 6, proteinG: 0.6, fatG: 0.2, sodiumMg: 1, potassiumMg: 112, phosphorusMg: 11, giIndex: 72, note: "GI 높지만 칼륨 부담 적음" },
      { foodName: "오렌지", category: "과일", energyKcal: 47, carbohydrateG: 12, sugarG: 9, proteinG: 0.9, fatG: 0.1, sodiumMg: 0, potassiumMg: 181, phosphorusMg: 14, giIndex: 43, note: "중간 칼륨" },
      { foodName: "딸기", category: "과일", energyKcal: 32, carbohydrateG: 7.7, sugarG: 4.9, proteinG: 0.7, fatG: 0.3, sodiumMg: 1, potassiumMg: 153, phosphorusMg: 24, giIndex: 40, note: "저GI, 저칼륨" },
      { foodName: "키위", category: "과일", energyKcal: 61, carbohydrateG: 15, sugarG: 9, proteinG: 1.1, fatG: 0.5, sodiumMg: 3, potassiumMg: 312, phosphorusMg: 34, giIndex: 50, note: "칼륨 높음" },

      // 4. 단백질 식품 (7개)
      { foodName: "닭가슴살 (삶은 것)", category: "단백질", energyKcal: 165, carbohydrateG: 0, sugarG: 0, proteinG: 31, fatG: 3.6, sodiumMg: 74, potassiumMg: 256, phosphorusMg: 228, giIndex: 0, note: "인 함량 높은 공급원" },
      { foodName: "삼겹살 (구운 것)", category: "단백질", energyKcal: 518, carbohydrateG: 0, sugarG: 0, proteinG: 9, fatG: 53, sodiumMg: 32, potassiumMg: 185, phosphorusMg: 130, giIndex: 0, note: "지방 높음" },
      { foodName: "두부", category: "단백질", energyKcal: 76, carbohydrateG: 1.9, sugarG: 0.6, proteinG: 8, fatG: 4.8, sodiumMg: 7, potassiumMg: 121, phosphorusMg: 97, giIndex: 15, note: "식물성 단백질 - 일반적으로 안전" },
      { foodName: "계란 (삶은 것)", category: "단백질", energyKcal: 155, carbohydrateG: 1.1, sugarG: 1.1, proteinG: 13, fatG: 11, sodiumMg: 124, potassiumMg: 126, phosphorusMg: 198, giIndex: 0, note: "노른자에 인 함유" },
      { foodName: "고등어 (구운 것)", category: "단백질", energyKcal: 205, carbohydrateG: 0, sugarG: 0, proteinG: 19, fatG: 14, sodiumMg: 90, potassiumMg: 314, phosphorusMg: 217, giIndex: 0, note: "오메가-3, 인/칼륨 주의" },
      { foodName: "소고기 (살코기)", category: "단백질", energyKcal: 250, carbohydrateG: 0, sugarG: 0, proteinG: 26, fatG: 15, sodiumMg: 72, potassiumMg: 318, phosphorusMg: 215, giIndex: 0, note: "인 함량 높음" },
      { foodName: "저지방 우유", category: "단백질", energyKcal: 42, carbohydrateG: 5, sugarG: 5, proteinG: 3.4, fatG: 1, sodiumMg: 44, potassiumMg: 150, phosphorusMg: 93, giIndex: 27, note: "액체 인 공급원" },

      // 5. 가공/기타 식품 (3개)
      { foodName: "라면", category: "가공식품", energyKcal: 450, carbohydrateG: 65, sugarG: 4, proteinG: 10, fatG: 17, sodiumMg: 1700, potassiumMg: 150, phosphorusMg: 120, giIndex: 73, note: "극심한 나트륨 경고" },
      { foodName: "콜라", category: "가공식품", energyKcal: 38, carbohydrateG: 10.6, sugarG: 10.6, proteinG: 0, fatG: 0, sodiumMg: 4, potassiumMg: 0, phosphorusMg: 15, giIndex: 60, note: "고당류, 인 첨가물" },
      { foodName: "감자칩", category: "가공식품", energyKcal: 536, carbohydrateG: 53, sugarG: 0.2, proteinG: 7, fatG: 35, sodiumMg: 525, potassiumMg: 1275, phosphorusMg: 164, giIndex: 70, note: "칼륨 & 나트륨 매우 높음" },
    ];

    initialFoods.forEach(food => this.createFood(food));
  }
}

export const storage = new MemStorage();
