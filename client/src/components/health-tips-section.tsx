import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Newspaper, 
  Dumbbell, 
  Heart, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

interface HealthArticle {
  id: string;
  title: string;
  summary: string;
  category: "diabetes" | "ckd" | "nutrition" | "general";
  readTime: string;
  isNew?: boolean;
}

interface ExerciseTip {
  id: string;
  title: string;
  description: string;
  duration: string;
  intensity: "low" | "medium";
  benefits: string[];
  caution?: string;
}

const healthArticles: HealthArticle[] = [
  {
    id: "1",
    title: "당뇨병 환자를 위한 저GI 식단 가이드",
    summary: "혈당 급상승을 막는 저GI 음식 선택법과 식사 순서의 중요성을 알아봅니다.",
    category: "diabetes",
    readTime: "5분",
    isNew: true,
  },
  {
    id: "2",
    title: "CKD 환자의 칼륨 관리 전략",
    summary: "신장 기능에 따른 칼륨 섭취 조절법과 채소 데치기의 효과를 설명합니다.",
    category: "ckd",
    readTime: "4분",
    isNew: true,
  },
  {
    id: "3",
    title: "인(P) 섭취와 신장 건강의 관계",
    summary: "가공식품에 숨겨진 인 첨가물을 피하고 신장을 보호하는 방법입니다.",
    category: "ckd",
    readTime: "6분",
  },
  {
    id: "4",
    title: "당뇨와 신장질환 복합 관리의 핵심",
    summary: "두 질환을 함께 관리할 때 우선순위와 식이 원칙을 정리했습니다.",
    category: "general",
    readTime: "7분",
  },
  {
    id: "5",
    title: "나트륨 줄이기: 실천 가능한 조리법",
    summary: "싱겁게 먹으면서도 맛있게! 한식 조리법 개선 팁을 소개합니다.",
    category: "nutrition",
    readTime: "4분",
  },
];

const exerciseTips: ExerciseTip[] = [
  {
    id: "1",
    title: "식후 가벼운 산책",
    description: "식사 후 15-30분 후 천천히 걷기. 혈당 조절에 매우 효과적입니다.",
    duration: "20-30분",
    intensity: "low",
    benefits: ["혈당 상승 억제", "소화 촉진", "심폐 기능 개선"],
  },
  {
    id: "2",
    title: "앉아서 하는 스트레칭",
    description: "의자에 앉아서 할 수 있는 전신 스트레칭. 투석 중에도 가능합니다.",
    duration: "10-15분",
    intensity: "low",
    benefits: ["혈액순환 개선", "관절 유연성", "피로 감소"],
  },
  {
    id: "3",
    title: "수중 걷기 (아쿠아워킹)",
    description: "관절에 부담 없이 할 수 있는 전신 운동입니다.",
    duration: "30-40분",
    intensity: "medium",
    benefits: ["관절 보호", "근력 강화", "심폐 지구력"],
    caution: "투석 환자는 감염 주의, 운동 전 의료진 상담 필요",
  },
  {
    id: "4",
    title: "탄력밴드 저항운동",
    description: "가벼운 저항으로 근력을 키우는 운동. 집에서 간편하게 가능합니다.",
    duration: "15-20분",
    intensity: "low",
    benefits: ["근력 유지", "인슐린 민감성 개선", "골밀도 유지"],
    caution: "고혈압 환자는 과도한 힘주기 주의, 의료진 상담 권장",
  },
  {
    id: "5",
    title: "호흡 명상",
    description: "깊은 복식호흡과 함께하는 명상으로 스트레스를 관리합니다.",
    duration: "10-15분",
    intensity: "low",
    benefits: ["스트레스 감소", "혈압 안정", "수면 개선"],
  },
];

const categoryColors: Record<string, string> = {
  diabetes: "bg-rose-500",
  ckd: "bg-blue-500",
  nutrition: "bg-green-500",
  general: "bg-purple-500",
};

const categoryLabels: Record<string, string> = {
  diabetes: "당뇨",
  ckd: "신장",
  nutrition: "영양",
  general: "종합",
};

export function HealthTipsSection() {
  return (
    <div>
      <div className="flex items-center gap-2 text-lg font-semibold mb-4">
        <Heart className="h-5 w-5 text-rose-500" />
        건강 정보
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="articles" className="flex items-center gap-2" data-testid="tab-health-articles">
            <Newspaper className="h-4 w-4" />
            건강 기사
          </TabsTrigger>
          <TabsTrigger value="exercise" className="flex items-center gap-2" data-testid="tab-exercise-tips">
            <Dumbbell className="h-4 w-4" />
            추천 운동
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="mt-0 space-y-3">
          {healthArticles.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card 
                className="cursor-pointer transition-all hover-elevate"
                data-testid={`article-card-${article.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs text-white ${categoryColors[article.category]}`}
                        >
                          {categoryLabels[article.category]}
                        </Badge>
                        {article.isNew && (
                          <Badge variant="outline" className="text-xs border-rose-400 text-rose-500">
                            NEW
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-foreground mb-1">
                        {article.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {article.summary}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="exercise" className="mt-0 space-y-3">
          {exerciseTips.map((tip, idx) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card data-testid={`exercise-card-${tip.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm text-foreground">
                      {tip.title}
                    </h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {tip.duration}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${tip.intensity === "low" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"}`}
                      >
                        {tip.intensity === "low" ? "저강도" : "중강도"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {tip.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tip.benefits.map((benefit, i) => (
                      <span 
                        key={i}
                        className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {benefit}
                      </span>
                    ))}
                  </div>
                  {tip.caution && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 p-2 rounded">
                      <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>{tip.caution}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          <p className="text-xs text-muted-foreground text-center pt-2">
            모든 운동은 개인 건강 상태에 맞게 조절하시고, 새로운 운동 시작 전 의료진과 상담하세요.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
