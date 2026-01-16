import { useState } from "react";
import { useFoods } from "@/hooks/use-foods";
import { Input, Card } from "./ui-kit";
import { Search, Apple, Wheat, Beef, Carrot, Package, Loader2 } from "lucide-react";
import { type FoodItem } from "@shared/schema";

interface FoodSearchProps {
  onSelectFood: (food: FoodItem) => void;
  selectedFoodId?: number;
}

export function FoodSearch({ onSelectFood, selectedFoodId }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const { data: foods, isLoading, error } = useFoods(query);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "과일": return <Apple className="h-4 w-4" />;
      case "곡류": return <Wheat className="h-4 w-4" />;
      case "단백질": return <Beef className="h-4 w-4" />;
      case "채소": return <Carrot className="h-4 w-4" />;
      case "가공식품": return <Package className="h-4 w-4" />;
      default: return <Apple className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="음식 검색 (예: 현미밥, 사과, 바나나...)" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 text-lg shadow-sm"
          data-testid="input-food-search"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[500px] pr-2 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-destructive">
            음식 목록을 불러오는데 실패했습니다. 다시 시도해주세요.
          </div>
        ) : foods?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            "{query}"에 해당하는 음식이 없습니다
          </div>
        ) : (
          foods?.map((food) => (
            <button
              key={food.id}
              onClick={() => onSelectFood(food)}
              className={`w-full text-left transition-all duration-200 group ${
                selectedFoodId === food.id ? "scale-[1.02]" : ""
              }`}
              data-testid={`button-food-${food.id}`}
            >
              <Card className={`p-4 hover:border-primary hover:shadow-md transition-all ${
                selectedFoodId === food.id 
                  ? "border-primary bg-primary/5 ring-1 ring-primary" 
                  : "border-border"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {food.foodName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-full">
                        {getCategoryIcon(food.category)}
                        {food.category}
                      </span>
                      <span>•</span>
                      <span>{food.energyKcal} kcal</span>
                    </div>
                  </div>
                  {selectedFoodId === food.id && (
                    <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                      선택됨
                    </div>
                  )}
                </div>
              </Card>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
