import { useSavedProfiles, useDeleteProfile } from "@/hooks/use-foods";
import { type SavedProfile, type PatientProfile } from "@shared/schema";
import { Card, CardContent, Button } from "./ui-kit";
import { Calendar, User, Trash2, Clock, Loader2, List, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ProfileTrendsChart } from "./profile-trends-chart";

interface SavedProfilesProps {
  onLoadProfile: (profile: PatientProfile) => void;
}

export function SavedProfiles({ onLoadProfile }: SavedProfilesProps) {
  const { data: profiles, isLoading, error } = useSavedProfiles();
  const deleteMutation = useDeleteProfile();

  const handleLoad = (saved: SavedProfile) => {
    const profile: PatientProfile = {
      gender: saved.gender as "Male" | "Female",
      age: saved.age,
      heightCm: saved.heightCm,
      weightKg: saved.weightKg,
      hasDm: saved.hasDm === 1,
      ckdStage: saved.ckdStage,
      eGFR: saved.eGFR ?? undefined,
      serumPotassium: saved.serumPotassium ?? undefined,
      hba1c: saved.hba1c ?? undefined,
    };
    onLoadProfile(profile);
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("이 프로필을 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-destructive text-sm">
        프로필을 불러오는데 실패했습니다.
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">저장된 프로필이 없습니다</p>
        <p className="text-xs mt-1">프로필을 저장하면 여기에 표시됩니다</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="list" className="flex items-center gap-2" data-testid="tab-profile-list">
          <List className="h-4 w-4" />
          목록
        </TabsTrigger>
        <TabsTrigger value="chart" className="flex items-center gap-2" data-testid="tab-profile-chart">
          <TrendingUp className="h-4 w-4" />
          그래프
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="mt-0">
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          <AnimatePresence>
            {profiles.map((saved, idx) => (
              <motion.div
                key={saved.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-all hover-elevate"
                  onClick={() => handleLoad(saved)}
                  data-testid={`saved-profile-${saved.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground truncate">
                            {saved.profileName}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(saved.createdAt), "yyyy년 M월 d일 HH:mm", { locale: ko })}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary" className="text-xs">
                            CKD {saved.ckdStage}단계
                          </Badge>
                          {saved.hasDm === 1 && (
                            <Badge variant="secondary" className="text-xs">
                              당뇨
                            </Badge>
                          )}
                          {saved.hba1c && (
                            <Badge variant="outline" className="text-xs">
                              HbA1c {saved.hba1c}%
                            </Badge>
                          )}
                          {saved.eGFR && (
                            <Badge variant="outline" className="text-xs">
                              eGFR {saved.eGFR}
                            </Badge>
                          )}
                          {saved.serumPotassium && (
                            <Badge variant="outline" className="text-xs">
                              K {saved.serumPotassium}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(saved.id, e)}
                        disabled={deleteMutation.isPending}
                        data-testid={`delete-profile-${saved.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </TabsContent>

      <TabsContent value="chart" className="mt-0">
        <ProfileTrendsChart profiles={profiles} />
      </TabsContent>
    </Tabs>
  );
}
