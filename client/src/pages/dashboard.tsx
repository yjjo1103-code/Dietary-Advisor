import { useState } from "react";
import { PatientProfileForm } from "@/components/patient-profile-form";
import { FoodSearch } from "@/components/food-search";
import { AnalysisResultCard } from "@/components/analysis-result.tsx";
import { HealthTipsSection } from "@/components/health-tips-section";
import { useAnalyzeFood, fetchFoodById } from "@/hooks/use-foods";
import { type PatientProfile, type FoodItem, type AnalysisResult } from "@shared/schema";
import { Button } from "@/components/ui-kit";
import { ChevronRight, Utensils, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analyzeMutation = useAnalyzeFood();

  const handleAnalyze = async () => {
    if (!profile || !selectedFood) return;
    
    try {
      const result = await analyzeMutation.mutateAsync({
        foodId: selectedFood.id,
        profile,
      });
      setAnalysisResult(result);
      
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error("Analysis failed", error);
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setAnalysisResult(null);
  };

  const { toast } = useToast();

  const handleRecommendationSelect = async (foodId: number) => {
    if (!profile) return;
    
    try {
      const food = await fetchFoodById(foodId);
      setSelectedFood(food);
      
      const result = await analyzeMutation.mutateAsync({
        foodId: food.id,
        profile,
      });
      setAnalysisResult(result);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast({
        title: "음식 변경됨",
        description: `${food.foodName}으로 변경되었습니다.`,
      });
    } catch (error) {
      console.error("Failed to select recommendation", error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display leading-tight text-primary">뉴트리케어</h1>
              <p className="text-xs text-muted-foreground">당뇨·신장질환 식이관리 도우미</p>
            </div>
          </div>
          <div className="text-xs font-medium bg-secondary px-3 py-1 rounded-full text-secondary-foreground hidden sm:block">
            PoC v1.0
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Patient Profile */}
          <div className="lg:col-span-4 space-y-6">
            <PatientProfileForm 
              onProfileChange={setProfile} 
              className="shadow-sm border-2 border-border/60 sticky top-24"
            />
          </div>

          {/* Right Column: Interaction Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step 1: Search Food */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                음식 선택
              </h2>
              <div className="bg-white dark:bg-card rounded-2xl p-6 border shadow-sm">
                <FoodSearch 
                  onSelectFood={handleFoodSelect} 
                  selectedFoodId={selectedFood?.id}
                />
              </div>
            </section>

            {/* Action Bar */}
            <AnimatePresence>
              {selectedFood && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-end pt-2"
                >
                  <Button 
                    size="lg" 
                    onClick={handleAnalyze} 
                    isLoading={analyzeMutation.isPending}
                    disabled={!profile}
                    className="w-full sm:w-auto text-lg shadow-lg shadow-primary/20"
                    data-testid="button-analyze"
                  >
                    {!profile ? "프로필을 먼저 입력하세요" : "안전성 분석하기"}
                    {profile && <ChevronRight className="ml-2 h-5 w-5" />}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {analyzeMutation.isError && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                <p>{analyzeMutation.error.message}</p>
              </div>
            )}

            {/* Step 2: Results */}
            <AnimatePresence>
              {analysisResult && (
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    분석 결과
                  </h2>
                  <AnalysisResultCard result={analysisResult} onSelectFood={handleRecommendationSelect} />
                </section>
              )}
            </AnimatePresence>

            {/* Health Tips Section */}
            <section className="bg-white dark:bg-card rounded-2xl p-6 border shadow-sm">
              <HealthTipsSection />
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
