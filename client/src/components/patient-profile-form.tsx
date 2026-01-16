import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientProfileSchema, type PatientProfile } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent, Label, Input, Select } from "./ui-kit";
import { User, Activity, AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface PatientProfileFormProps {
  onProfileChange: (profile: PatientProfile | null) => void;
  className?: string;
}

export function PatientProfileForm({ onProfileChange, className }: PatientProfileFormProps) {
  const form = useForm<PatientProfile>({
    resolver: zodResolver(patientProfileSchema),
    mode: "onChange",
    defaultValues: {
      hasDm: false,
      gender: "Male",
      ckdStage: 1,
      age: 65,
      heightCm: 170,
      weightKg: 70,
    },
  });

  // Watch all fields and emit changes if valid
  const values = form.watch();
  
  useEffect(() => {
    // Only emit if we have minimum valid data to avoid partial state issues
    const subscription = form.watch((value, { name, type }) => {
      // Trigger validation check or just attempt parse
      const result = patientProfileSchema.safeParse(value);
      if (result.success) {
        onProfileChange(result.data);
      } else {
        // Optional: Could pass null to indicate invalid profile
        // onProfileChange(null);
      }
    });
    
    // Initial emission
    const initialParse = patientProfileSchema.safeParse(form.getValues());
    if (initialParse.success) {
      onProfileChange(initialParse.data);
    }

    return () => subscription.unsubscribe();
  }, [form, onProfileChange]);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 text-primary">
          <User className="h-5 w-5" />
          <CardTitle>Patient Profile</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter clinical data to calibrate the analysis engine.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demographics Group */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Demographics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select {...form.register("gender")} id="gender">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input {...form.register("age", { valueAsNumber: true })} type="number" id="age" />
              {form.formState.errors.age && (
                <span className="text-xs text-destructive">{form.formState.errors.age.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input {...form.register("heightCm", { valueAsNumber: true })} type="number" id="height" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input {...form.register("weightKg", { valueAsNumber: true })} type="number" id="weight" />
            </div>
          </div>
        </div>

        <div className="h-px bg-border/50" />

        {/* Clinical Data Group */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Clinical Conditions</h4>
          </div>
          
          <div className="space-y-4 bg-secondary/30 p-4 rounded-xl border border-secondary">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasDm" className="flex flex-col">
                <span className="text-base font-semibold">Diabetes Mellitus</span>
                <span className="font-normal text-muted-foreground text-xs">Does the patient have Type 2 Diabetes?</span>
              </Label>
              <input 
                type="checkbox" 
                id="hasDm" 
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                {...form.register("hasDm")} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ckdStage">CKD Stage</Label>
              <Select {...form.register("ckdStage", { valueAsNumber: true })} id="ckdStage">
                <option value="1">Stage 1 (Normal)</option>
                <option value="2">Stage 2 (Mild)</option>
                <option value="3">Stage 3 (Moderate)</option>
                <option value="4">Stage 4 (Severe)</option>
                <option value="5">Stage 5 (Kidney Failure)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hba1c" className="text-xs">HbA1c (%)</Label>
              <Input 
                {...form.register("hba1c", { valueAsNumber: true })} 
                type="number" step="0.1" 
                placeholder="e.g. 6.5" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="egfr" className="text-xs">eGFR</Label>
              <Input 
                {...form.register("eGFR", { valueAsNumber: true })} 
                type="number" 
                placeholder="e.g. 90" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="potassium" className="text-xs">Potassium (mg)</Label>
              <Input 
                {...form.register("serumPotassium", { valueAsNumber: true })} 
                type="number" step="0.1" 
                placeholder="Serum K+" 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
