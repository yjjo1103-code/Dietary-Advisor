import { useState } from "react";
import { useFoods } from "@/hooks/use-foods";
import { Input, Button, Card } from "./ui-kit";
import { Search, Apple, Wheat, Beef, Car, Loader2 } from "lucide-react";
import { type FoodItem } from "@shared/schema";

interface FoodSearchProps {
  onSelectFood: (food: FoodItem) => void;
  selectedFoodId?: number;
}

export function FoodSearch({ onSelectFood, selectedFoodId }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  // Only search when query length > 0 or on initial load
  const { data: foods, isLoading, error } = useFoods(query);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Fruit": return <Apple className="h-4 w-4" />;
      case "Grain": return <Wheat className="h-4 w-4" />;
      case "Protein": return <Beef className="h-4 w-4" />;
      case "Vegetable": return <Car className="h-4 w-4" />; // Carrot substitute
      default: return <Apple className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search for food (e.g. Rice, Apple)..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 text-lg shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[500px] pr-2 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-destructive">
            Failed to load foods. Please try again.
          </div>
        ) : foods?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No foods found matching "{query}"
          </div>
        ) : (
          foods?.map((food) => (
            <button
              key={food.id}
              onClick={() => onSelectFood(food)}
              className={`w-full text-left transition-all duration-200 group ${
                selectedFoodId === food.id ? "scale-[1.02]" : ""
              }`}
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
                      Selected
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
