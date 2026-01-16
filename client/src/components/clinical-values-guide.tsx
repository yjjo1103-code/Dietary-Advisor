import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Info, 
  Droplets, 
  Activity,
  Beaker,
  AlertCircle
} from "lucide-react";

interface ClinicalValue {
  id: string;
  name: string;
  fullName: string;
  icon: typeof Info;
  normalRange: string;
  description: string;
  warning: string;
  badgeColor: string;
}

const clinicalValues: ClinicalValue[] = [
  {
    id: "hba1c",
    name: "HbA1c",
    fullName: "당화혈색소",
    icon: Droplets,
    normalRange: "4.0 ~ 5.6%",
    description: "최근 2~3개월간의 평균 혈당 수치를 반영합니다.",
    warning: "6.5% 이상이면 당뇨병으로 진단됩니다.",
    badgeColor: "bg-rose-500",
  },
  {
    id: "egfr",
    name: "eGFR",
    fullName: "추정 사구체여과율",
    icon: Activity,
    normalRange: "90 이상",
    description: "신장이 혈액을 여과하는 능력을 나타내는 수치입니다.",
    warning: "60 미만이 3개월 이상 지속되면 만성신장질환(CKD)으로 진단됩니다.",
    badgeColor: "bg-blue-500",
  },
  {
    id: "potassium",
    name: "혈청 칼륨 (K+)",
    fullName: "혈중 칼륨 농도",
    icon: Beaker,
    normalRange: "3.5 ~ 5.0 mEq/L",
    description: "심장과 근육 기능에 중요한 전해질입니다.",
    warning: "신장 기능이 저하되면 고칼륨혈증(5.0 이상) 위험이 높아집니다.",
    badgeColor: "bg-amber-500",
  },
];

export function ClinicalValuesGuide() {
  return (
    <div>
      <div className="flex items-center gap-2 text-lg font-semibold mb-4">
        <Info className="h-5 w-5 text-blue-500" />
        임상 수치 가이드
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        프로필에 입력하는 임상 수치들의 의미와 정상 범위를 확인하세요.
      </p>

      <div className="space-y-3">
        {clinicalValues.map((value) => {
          const IconComponent = value.icon;
          return (
            <Card key={value.id} data-testid={`clinical-guide-${value.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${value.badgeColor} text-white shrink-0`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium text-sm text-foreground">
                        {value.name}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        ({value.fullName})
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {value.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        정상 범위: {value.normalRange}
                      </Badge>
                    </div>
                    
                    <div className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 p-2 rounded">
                      <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>{value.warning}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        정확한 진단은 반드시 의료 전문가와 상담하세요.
      </p>
    </div>
  );
}
