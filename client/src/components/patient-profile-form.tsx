import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientProfileSchema, type PatientProfile } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent, Label, Input, Select, Button } from "./ui-kit";
import { User, Activity, Save, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useCreateProfile } from "@/hooks/use-foods";
import { useToast } from "@/hooks/use-toast";
import { SavedProfiles } from "./saved-profiles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PatientProfileFormProps {
  onProfileChange: (profile: PatientProfile | null) => void;
  className?: string;
}

export function PatientProfileForm({ onProfileChange, className }: PatientProfileFormProps) {
  const [profileName, setProfileName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const { toast } = useToast();
  const createProfileMutation = useCreateProfile();

  const form = useForm<PatientProfile>({
    resolver: zodResolver(patientProfileSchema),
    mode: "onChange",
    defaultValues: {
      hasDm: true,
      gender: "Male",
      ckdStage: 3,
      age: 65,
      heightCm: 170,
      weightKg: 70,
      hba1c: 7.5,
      eGFR: 45,
      serumPotassium: 4.5,
    },
  });

  const values = form.watch();
  
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      const result = patientProfileSchema.safeParse(value);
      if (result.success) {
        onProfileChange(result.data);
      }
    });
    
    const initialParse = patientProfileSchema.safeParse(form.getValues());
    if (initialParse.success) {
      onProfileChange(initialParse.data);
    }

    return () => subscription.unsubscribe();
  }, [form, onProfileChange]);

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast({
        title: "이름을 입력하세요",
        description: "프로필 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const currentValues = form.getValues();
    try {
      await createProfileMutation.mutateAsync({
        profileName: profileName.trim(),
        gender: currentValues.gender,
        age: currentValues.age,
        heightCm: currentValues.heightCm,
        weightKg: currentValues.weightKg,
        hasDm: currentValues.hasDm ? 1 : 0,
        ckdStage: currentValues.ckdStage,
        eGFR: currentValues.eGFR ?? null,
        serumPotassium: currentValues.serumPotassium ?? null,
        hba1c: currentValues.hba1c ?? null,
      });

      toast({
        title: "프로필 저장됨",
        description: `"${profileName}" 프로필이 저장되었습니다.`,
      });
      setProfileName("");
      setShowSaveDialog(false);
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "프로필 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleLoadProfile = (profile: PatientProfile) => {
    form.reset(profile);
    onProfileChange(profile);
    setShowLoadDialog(false);
    toast({
      title: "프로필 불러옴",
      description: "저장된 프로필이 적용되었습니다.",
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <User className="h-5 w-5" />
            <CardTitle>환자 프로필</CardTitle>
          </div>
          <div className="flex gap-1">
            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" data-testid="button-load-profile">
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>내 프로필</DialogTitle>
                </DialogHeader>
                <SavedProfiles onLoadProfile={handleLoadProfile} />
              </DialogContent>
            </Dialog>

            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" data-testid="button-save-profile">
                  <Save className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>프로필 저장</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">프로필 이름</Label>
                    <Input
                      id="profile-name"
                      placeholder="예: 2026년 1월 검사 결과"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      data-testid="input-profile-name"
                    />
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg text-sm space-y-1">
                    <p className="font-medium">저장될 데이터:</p>
                    <p className="text-muted-foreground">
                      CKD {values.ckdStage}단계, {values.hasDm ? "당뇨O" : "당뇨X"}, 
                      HbA1c {values.hba1c || "-"}%, eGFR {values.eGFR || "-"}, K {values.serumPotassium || "-"}
                    </p>
                  </div>
                  <Button 
                    onClick={handleSaveProfile} 
                    className="w-full"
                    isLoading={createProfileMutation.isPending}
                    data-testid="button-confirm-save"
                  >
                    저장하기
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          분석을 위한 임상 데이터를 입력하세요.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demographics Group */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">기본 정보</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">성별</Label>
              <Select {...form.register("gender")} id="gender" data-testid="select-gender">
                <option value="Male">남성</option>
                <option value="Female">여성</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">나이</Label>
              <Input {...form.register("age", { valueAsNumber: true })} type="number" id="age" data-testid="input-age" />
              {form.formState.errors.age && (
                <span className="text-xs text-destructive">{form.formState.errors.age.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">키 (cm)</Label>
              <Input {...form.register("heightCm", { valueAsNumber: true })} type="number" id="height" data-testid="input-height" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">체중 (kg)</Label>
              <Input {...form.register("weightKg", { valueAsNumber: true })} type="number" id="weight" data-testid="input-weight" />
            </div>
          </div>
        </div>

        <div className="h-px bg-border/50" />

        {/* Clinical Data Group */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">질환 정보</h4>
          </div>
          
          <div className="space-y-4 bg-secondary/30 p-4 rounded-xl border border-secondary">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasDm" className="flex flex-col">
                <span className="text-base font-semibold">당뇨병 (DM)</span>
                <span className="font-normal text-muted-foreground text-xs">제2형 당뇨병 진단 여부</span>
              </Label>
              <input 
                type="checkbox" 
                id="hasDm" 
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                {...form.register("hasDm")} 
                data-testid="checkbox-dm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ckdStage">만성신장질환 (CKD) 단계</Label>
              <Select {...form.register("ckdStage", { valueAsNumber: true })} id="ckdStage" data-testid="select-ckd-stage">
                <option value="1">1단계 (정상)</option>
                <option value="2">2단계 (경증)</option>
                <option value="3">3단계 (중등도)</option>
                <option value="4">4단계 (중증)</option>
                <option value="5">5단계 (말기신부전)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hba1c" className="text-xs">HbA1c (%)</Label>
              <Input 
                {...form.register("hba1c", { valueAsNumber: true })} 
                type="number" step="0.1" 
                placeholder="예: 6.5" 
                data-testid="input-hba1c"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="egfr" className="text-xs">eGFR</Label>
              <Input 
                {...form.register("eGFR", { valueAsNumber: true })} 
                type="number" 
                placeholder="예: 90" 
                data-testid="input-egfr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="potassium" className="text-xs">혈청 칼륨 (K+)</Label>
              <Input 
                {...form.register("serumPotassium", { valueAsNumber: true })} 
                type="number" step="0.1" 
                placeholder="예: 4.5" 
                data-testid="input-potassium"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
