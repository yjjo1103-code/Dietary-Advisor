import { type AnalysisResult, type RecommendedFood } from "@shared/schema";
import { Card, CardContent } from "./ui-kit";
import { AlertTriangle, CheckCircle, Info, XCircle, Stethoscope, Activity, Utensils, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";

interface AnalysisResultCardProps {
  result: AnalysisResult;
  onSelectFood?: (foodId: number) => void;
}

function FoodRecommendationList({ 
  foods, 
  title, 
  icon: Icon, 
  variant,
  onSelectFood
}: { 
  foods: RecommendedFood[]; 
  title: string; 
  icon: React.ElementType;
  variant: "safe" | "alternative";
  onSelectFood?: (foodId: number) => void;
}) {
  if (!foods || foods.length === 0) return null;

  const bgColor = variant === "safe" 
    ? "bg-green-50 dark:bg-green-950/30" 
    : "bg-amber-50 dark:bg-amber-950/30";
  const borderColor = variant === "safe"
    ? "border-green-200 dark:border-green-800"
    : "border-amber-200 dark:border-amber-800";
  const iconColor = variant === "safe"
    ? "text-green-600 dark:text-green-400"
    : "text-amber-600 dark:text-amber-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`${bgColor} rounded-xl p-4 border ${borderColor}`}
    >
      <div className={`flex items-center gap-2 mb-3 ${iconColor}`}>
        <Icon className="h-5 w-5" />
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <div className="grid gap-2">
        {foods.map((food, idx) => (
          <motion.button
            key={food.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            onClick={() => onSelectFood?.(food.id)}
            className="flex items-center justify-between p-3 bg-background rounded-lg border shadow-sm hover-elevate text-left w-full"
            data-testid={`recommendation-food-${food.id}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground truncate">{food.foodName}</span>
                <Badge variant="secondary" className="text-xs shrink-0">{food.category}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{food.reason}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export function AnalysisResultCard({ result, onSelectFood }: AnalysisResultCardProps) {
  const statusConfig = {
    Safe: {
      color: "bg-[hsl(var(--status-safe))]",
      border: "border-[hsl(var(--status-safe))]",
      text: "text-[hsl(var(--status-safe))]",
      icon: CheckCircle,
      label: "섭취 가능",
      variant: "safe" as const,
    },
    Caution: {
      color: "bg-[hsl(var(--status-caution))]",
      border: "border-[hsl(var(--status-caution))]",
      text: "text-[hsl(var(--status-caution))]",
      icon: AlertTriangle,
      label: "주의 필요",
      variant: "caution" as const,
    },
    Limit: {
      color: "bg-[hsl(var(--status-limit))]",
      border: "border-[hsl(var(--status-limit))]",
      text: "text-[hsl(var(--status-limit))]",
      icon: XCircle,
      label: "제한 / 피하세요",
      variant: "limit" as const,
    },
  };

  const config = statusConfig[result.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      data-testid="analysis-result"
    >
      <Card className={`overflow-hidden border-2 ${config.border} shadow-lg`}>
        {/* Header Status Banner */}
        <div className={`${config.color} p-4 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-bold font-display uppercase tracking-wider opacity-90">분석 결과</h3>
              <p className="text-2xl font-bold leading-none" data-testid="text-status">{config.label}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Nurse's Note */}
          <div className="bg-secondary/50 rounded-2xl p-5 border border-secondary relative mt-2">
            <div className="absolute -top-3 left-4 bg-background px-2 flex items-center gap-2 text-primary font-medium text-sm">
              <Stethoscope className="h-4 w-4" />
              <span>영양사 노트</span>
            </div>
            <p className="text-foreground leading-relaxed pt-2" data-testid="text-educational-message">
              "{result.educationalMessage}"
            </p>
          </div>

          {/* Details & Alerts */}
          {result.details.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                <Info className="h-4 w-4" />
                주요 주의사항
              </h4>
              <div className="grid gap-2">
                {result.details.map((detail, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-background border shadow-sm"
                    data-testid={`text-detail-${idx}`}
                  >
                    <div className={`mt-0.5 rounded-full p-1 ${result.status === "Safe" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      <Activity className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{detail}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Nutritional Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">칼륨</div>
              <div className="text-lg font-bold font-display" data-testid="text-potassium">{result.nutrientsOfInterest.potassium}mg</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">인</div>
              <div className="text-lg font-bold font-display" data-testid="text-phosphorus">{result.nutrientsOfInterest.phosphorus}mg</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">나트륨</div>
              <div className="text-lg font-bold font-display" data-testid="text-sodium">{result.nutrientsOfInterest.sodium}mg</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">당류</div>
              <div className="text-lg font-bold font-display" data-testid="text-sugar">{result.nutrientsOfInterest.sugar}g</div>
            </div>
          </div>

          {/* Recommendations (for Safe foods) */}
          {result.recommendations && result.recommendations.length > 0 && (
            <FoodRecommendationList
              foods={result.recommendations}
              title="추천 음식"
              icon={Utensils}
              variant="safe"
              onSelectFood={onSelectFood}
            />
          )}

          {/* Alternatives (for Limit foods) */}
          {result.alternatives && result.alternatives.length > 0 && (
            <FoodRecommendationList
              foods={result.alternatives}
              title="대체 가능 식품"
              icon={RefreshCw}
              variant="alternative"
              onSelectFood={onSelectFood}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
