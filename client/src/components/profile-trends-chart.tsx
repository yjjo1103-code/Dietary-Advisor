import { type SavedProfile } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { TrendingUp, Activity } from "lucide-react";

interface ProfileTrendsChartProps {
  profiles: SavedProfile[];
}

type MetricKey = "hba1c" | "eGFR" | "serumPotassium" | "ckdStage";

const metricConfig: Record<MetricKey, { label: string; color: string; unit: string }> = {
  hba1c: { label: "HbA1c", color: "#ef4444", unit: "%" },
  eGFR: { label: "eGFR", color: "#3b82f6", unit: "" },
  serumPotassium: { label: "칼륨 (K)", color: "#f59e0b", unit: "mEq/L" },
  ckdStage: { label: "CKD 단계", color: "#8b5cf6", unit: "" },
};

export function ProfileTrendsChart({ profiles }: ProfileTrendsChartProps) {
  const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(
    new Set(["hba1c", "eGFR"])
  );

  if (profiles.length < 2) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">그래프를 보려면 2개 이상의 프로필이 필요합니다</p>
        <p className="text-xs mt-1">프로필을 더 저장해주세요</p>
      </div>
    );
  }

  const sortedProfiles = [...profiles].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const chartData = sortedProfiles.map((p) => ({
    date: format(new Date(p.createdAt), "M/d", { locale: ko }),
    fullDate: format(new Date(p.createdAt), "yyyy년 M월 d일", { locale: ko }),
    name: p.profileName,
    hba1c: p.hba1c,
    eGFR: p.eGFR,
    serumPotassium: p.serumPotassium,
    ckdStage: p.ckdStage,
  }));

  const toggleMetric = (metric: MetricKey) => {
    const newSet = new Set(activeMetrics);
    if (newSet.has(metric)) {
      if (newSet.size > 1) {
        newSet.delete(metric);
      }
    } else {
      newSet.add(metric);
    }
    setActiveMetrics(newSet);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium mb-1">{data?.fullDate}</p>
          <p className="text-xs text-muted-foreground mb-2">{data?.name}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>
                {metricConfig[entry.dataKey as MetricKey]?.label}: {entry.value ?? "-"}
                {metricConfig[entry.dataKey as MetricKey]?.unit}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">수치 변화 추이</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(metricConfig) as MetricKey[]).map((key) => {
          const config = metricConfig[key];
          const isActive = activeMetrics.has(key);
          return (
            <Badge
              key={key}
              variant={isActive ? "default" : "outline"}
              className="cursor-pointer transition-all"
              style={isActive ? { backgroundColor: config.color } : {}}
              onClick={() => toggleMetric(key)}
              data-testid={`toggle-metric-${key}`}
            >
              {config.label}
            </Badge>
          );
        })}
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip content={<CustomTooltip />} />
            
            {activeMetrics.has("hba1c") && (
              <Line
                type="monotone"
                dataKey="hba1c"
                stroke={metricConfig.hba1c.color}
                strokeWidth={2}
                dot={{ fill: metricConfig.hba1c.color, r: 4 }}
                connectNulls={false}
                name="HbA1c"
              />
            )}
            {activeMetrics.has("eGFR") && (
              <Line
                type="monotone"
                dataKey="eGFR"
                stroke={metricConfig.eGFR.color}
                strokeWidth={2}
                dot={{ fill: metricConfig.eGFR.color, r: 4 }}
                connectNulls={false}
                name="eGFR"
              />
            )}
            {activeMetrics.has("serumPotassium") && (
              <Line
                type="monotone"
                dataKey="serumPotassium"
                stroke={metricConfig.serumPotassium.color}
                strokeWidth={2}
                dot={{ fill: metricConfig.serumPotassium.color, r: 4 }}
                connectNulls={false}
                name="칼륨"
              />
            )}
            {activeMetrics.has("ckdStage") && (
              <Line
                type="monotone"
                dataKey="ckdStage"
                stroke={metricConfig.ckdStage.color}
                strokeWidth={2}
                dot={{ fill: metricConfig.ckdStage.color, r: 4 }}
                connectNulls={false}
                name="CKD 단계"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        프로필 저장 날짜 기준으로 수치 변화를 확인할 수 있습니다
      </p>
    </div>
  );
}
