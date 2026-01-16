import { type AnalysisResult } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "./ui-kit";
import { AlertTriangle, CheckCircle, Info, XCircle, Stethoscope, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

export function AnalysisResultCard({ result }: AnalysisResultCardProps) {
  const statusConfig = {
    Safe: {
      color: "bg-[hsl(var(--status-safe))]",
      border: "border-[hsl(var(--status-safe))]",
      text: "text-[hsl(var(--status-safe))]",
      icon: CheckCircle,
      label: "Safe to Eat",
      variant: "safe" as const,
    },
    Caution: {
      color: "bg-[hsl(var(--status-caution))]",
      border: "border-[hsl(var(--status-caution))]",
      text: "text-[hsl(var(--status-caution))]",
      icon: AlertTriangle,
      label: "Caution Required",
      variant: "caution" as const,
    },
    Limit: {
      color: "bg-[hsl(var(--status-limit))]",
      border: "border-[hsl(var(--status-limit))]",
      text: "text-[hsl(var(--status-limit))]",
      icon: XCircle,
      label: "Limit / Avoid",
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
    >
      <Card className={`overflow-hidden border-2 ${config.border} shadow-lg`}>
        {/* Header Status Banner */}
        <div className={`${config.color} p-4 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-bold font-display uppercase tracking-wider opacity-90">Analysis Result</h3>
              <p className="text-2xl font-bold leading-none">{config.label}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Nurse's Note */}
          <div className="bg-secondary/50 rounded-2xl p-5 border border-secondary relative mt-2">
            <div className="absolute -top-3 left-4 bg-background px-2 flex items-center gap-2 text-primary font-medium text-sm">
              <Stethoscope className="h-4 w-4" />
              <span>Nurse's Note</span>
            </div>
            <p className="text-foreground leading-relaxed pt-2">
              "{result.educationalMessage}"
            </p>
          </div>

          {/* Details & Alerts */}
          {result.details.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                <Info className="h-4 w-4" />
                Key Concerns
              </h4>
              <div className="grid gap-2">
                {result.details.map((detail, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-background border shadow-sm"
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

          {/* Nutritional Breakdown (Simple Grid) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Potassium</div>
              <div className="text-lg font-bold font-display">{result.nutrientsOfInterest.potassium}mg</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Phosphorus</div>
              <div className="text-lg font-bold font-display">{result.nutrientsOfInterest.phosphorus}mg</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sodium</div>
              <div className="text-lg font-bold font-display">{result.nutrientsOfInterest.sodium}mg</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sugar</div>
              <div className="text-lg font-bold font-display">{result.nutrientsOfInterest.sugar}g</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
