import { type FoodItem, type InsertFood } from "@shared/schema";

export interface IStorage {
  searchFoods(query: string): Promise<FoodItem[]>;
  getFood(id: number): Promise<FoodItem | undefined>;
  // For this PoC, we will pre-seed data, but interface supports creation if needed later
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
      // 1. Grains (5 items)
      { foodName: "White Rice (Cooked)", category: "Grain", energyKcal: 130, carbohydrateG: 28, sugarG: 0.1, proteinG: 2.7, fatG: 0.3, sodiumMg: 1, potassiumMg: 35, phosphorusMg: 43, giIndex: 73, note: "" },
      { foodName: "Brown Rice (Cooked)", category: "Grain", energyKcal: 110, carbohydrateG: 23, sugarG: 0.4, proteinG: 2.6, fatG: 0.9, sodiumMg: 2, potassiumMg: 84, phosphorusMg: 102, giIndex: 68, note: "High phosphorus content" },
      { foodName: "Multigrain Bread", category: "Grain", energyKcal: 265, carbohydrateG: 43, sugarG: 6, proteinG: 13, fatG: 4, sodiumMg: 400, potassiumMg: 230, phosphorusMg: 180, giIndex: 55, note: "Watch for sodium and phosphorus" },
      { foodName: "Sweet Potato (Steamed)", category: "Grain", energyKcal: 128, carbohydrateG: 30, sugarG: 6, proteinG: 1.5, fatG: 0.2, sodiumMg: 10, potassiumMg: 380, phosphorusMg: 50, giIndex: 61, note: "High Potassium!" },
      { foodName: "Potato (Boiled)", category: "Grain", energyKcal: 77, carbohydrateG: 17, sugarG: 0.8, proteinG: 2, fatG: 0.1, sodiumMg: 6, potassiumMg: 421, phosphorusMg: 57, giIndex: 78, note: "Very High Potassium" },

      // 2. Vegetables (8 items)
      { foodName: "Spinach (Raw)", category: "Vegetable", energyKcal: 23, carbohydrateG: 3.6, sugarG: 0.4, proteinG: 2.9, fatG: 0.4, sodiumMg: 79, potassiumMg: 558, phosphorusMg: 49, giIndex: 15, note: "Extreme Potassium Caution" },
      { foodName: "Cucumber", category: "Vegetable", energyKcal: 15, carbohydrateG: 3.6, sugarG: 1.7, proteinG: 0.7, fatG: 0.1, sodiumMg: 2, potassiumMg: 147, phosphorusMg: 24, giIndex: 15, note: "Good low-potassium choice" },
      { foodName: "Carrot (Raw)", category: "Vegetable", energyKcal: 41, carbohydrateG: 10, sugarG: 4.7, proteinG: 0.9, fatG: 0.2, sodiumMg: 69, potassiumMg: 320, phosphorusMg: 35, giIndex: 35, note: "Moderate Potassium" },
      { foodName: "Cabbage (Boiled)", category: "Vegetable", energyKcal: 23, carbohydrateG: 5.5, sugarG: 2.8, proteinG: 1.3, fatG: 0.1, sodiumMg: 10, potassiumMg: 150, phosphorusMg: 25, giIndex: 15, note: "Leaching reduces potassium" },
      { foodName: "Tomato", category: "Vegetable", energyKcal: 18, carbohydrateG: 3.9, sugarG: 2.6, proteinG: 0.9, fatG: 0.2, sodiumMg: 5, potassiumMg: 237, phosphorusMg: 24, giIndex: 15, note: "Moderate-High Potassium" },
      { foodName: "Broccoli (Boiled)", category: "Vegetable", energyKcal: 35, carbohydrateG: 7.2, sugarG: 1.4, proteinG: 2.4, fatG: 0.4, sodiumMg: 41, potassiumMg: 293, phosphorusMg: 66, giIndex: 15, note: "" },
      { foodName: "Lettuce", category: "Vegetable", energyKcal: 15, carbohydrateG: 2.9, sugarG: 0.8, proteinG: 1.4, fatG: 0.2, sodiumMg: 28, potassiumMg: 194, phosphorusMg: 29, giIndex: 15, note: "" },
      { foodName: "Mushroom (Shiitake)", category: "Vegetable", energyKcal: 34, carbohydrateG: 6.8, sugarG: 2.4, proteinG: 2.2, fatG: 0.5, sodiumMg: 9, potassiumMg: 304, phosphorusMg: 112, giIndex: 15, note: "High Phosphorus/Potassium" },

      // 3. Fruits (7 items)
      { foodName: "Banana", category: "Fruit", energyKcal: 89, carbohydrateG: 23, sugarG: 12, proteinG: 1.1, fatG: 0.3, sodiumMg: 1, potassiumMg: 358, phosphorusMg: 22, giIndex: 51, note: "High Potassium" },
      { foodName: "Apple (w/ skin)", category: "Fruit", energyKcal: 52, carbohydrateG: 14, sugarG: 10, proteinG: 0.3, fatG: 0.2, sodiumMg: 1, potassiumMg: 107, phosphorusMg: 11, giIndex: 36, note: "Low Potassium choice" },
      { foodName: "Grapes", category: "Fruit", energyKcal: 69, carbohydrateG: 18, sugarG: 15, proteinG: 0.7, fatG: 0.2, sodiumMg: 2, potassiumMg: 191, phosphorusMg: 20, giIndex: 59, note: "" },
      { foodName: "Watermelon", category: "Fruit", energyKcal: 30, carbohydrateG: 8, sugarG: 6, proteinG: 0.6, fatG: 0.2, sodiumMg: 1, potassiumMg: 112, phosphorusMg: 11, giIndex: 72, note: "High GI but low K load per volume" },
      { foodName: "Orange", category: "Fruit", energyKcal: 47, carbohydrateG: 12, sugarG: 9, proteinG: 0.9, fatG: 0.1, sodiumMg: 0, potassiumMg: 181, phosphorusMg: 14, giIndex: 43, note: "Moderate Potassium" },
      { foodName: "Strawberry", category: "Fruit", energyKcal: 32, carbohydrateG: 7.7, sugarG: 4.9, proteinG: 0.7, fatG: 0.3, sodiumMg: 1, potassiumMg: 153, phosphorusMg: 24, giIndex: 40, note: "Low GI, Low K" },
      { foodName: "Kiwi", category: "Fruit", energyKcal: 61, carbohydrateG: 15, sugarG: 9, proteinG: 1.1, fatG: 0.5, sodiumMg: 3, potassiumMg: 312, phosphorusMg: 34, giIndex: 50, note: "High Potassium" },

      // 4. Protein Foods (7 items)
      { foodName: "Chicken Breast (Boiled)", category: "Protein", energyKcal: 165, carbohydrateG: 0, sugarG: 0, proteinG: 31, fatG: 3.6, sodiumMg: 74, potassiumMg: 256, phosphorusMg: 228, giIndex: 0, note: "High Phosphorus source" },
      { foodName: "Pork Belly (Grilled)", category: "Protein", energyKcal: 518, carbohydrateG: 0, sugarG: 0, proteinG: 9, fatG: 53, sodiumMg: 32, potassiumMg: 185, phosphorusMg: 130, giIndex: 0, note: "High Fat" },
      { foodName: "Tofu", category: "Protein", energyKcal: 76, carbohydrateG: 1.9, sugarG: 0.6, proteinG: 8, fatG: 4.8, sodiumMg: 7, potassiumMg: 121, phosphorusMg: 97, giIndex: 15, note: "Plant protein - generally safe" },
      { foodName: "Egg (Whole, Boiled)", category: "Protein", energyKcal: 155, carbohydrateG: 1.1, sugarG: 1.1, proteinG: 13, fatG: 11, sodiumMg: 124, potassiumMg: 126, phosphorusMg: 198, giIndex: 0, note: "Yolk has phosphorus" },
      { foodName: "Mackerel (Grilled)", category: "Protein", energyKcal: 205, carbohydrateG: 0, sugarG: 0, proteinG: 19, fatG: 14, sodiumMg: 90, potassiumMg: 314, phosphorusMg: 217, giIndex: 0, note: "Omega-3, but watch P/K" },
      { foodName: "Beef (Lean)", category: "Protein", energyKcal: 250, carbohydrateG: 0, sugarG: 0, proteinG: 26, fatG: 15, sodiumMg: 72, potassiumMg: 318, phosphorusMg: 215, giIndex: 0, note: "High Phosphorus" },
      { foodName: "Milk (Low Fat)", category: "Protein", energyKcal: 42, carbohydrateG: 5, sugarG: 5, proteinG: 3.4, fatG: 1, sodiumMg: 44, potassiumMg: 150, phosphorusMg: 93, giIndex: 27, note: "Liquid phosphorus source" },

      // 5. Processed/Other (3 items)
      { foodName: "Ramyeon (Instant Noodles)", category: "Processed", energyKcal: 450, carbohydrateG: 65, sugarG: 4, proteinG: 10, fatG: 17, sodiumMg: 1700, potassiumMg: 150, phosphorusMg: 120, giIndex: 73, note: "EXTREME Sodium Warning" },
      { foodName: "Coke (Cola)", category: "Processed", energyKcal: 38, carbohydrateG: 10.6, sugarG: 10.6, proteinG: 0, fatG: 0, sodiumMg: 4, potassiumMg: 0, phosphorusMg: 15, giIndex: 60, note: "High Sugar, Phosphorus additive" },
      { foodName: "Potato Chips", category: "Processed", energyKcal: 536, carbohydrateG: 53, sugarG: 0.2, proteinG: 7, fatG: 35, sodiumMg: 525, potassiumMg: 1275, phosphorusMg: 164, giIndex: 70, note: "Very High Potassium & Sodium" },
    ];

    initialFoods.forEach(food => this.createFood(food));
  }
}

export const storage = new MemStorage();
