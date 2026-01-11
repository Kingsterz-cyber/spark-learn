import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  School, 
  ArrowRight, 
  ArrowLeft,
  Check
} from "lucide-react";
import { toast } from "sonner";
import ThemeBackground from "@/components/ThemeBackground";

type SchoolType = "primary" | "middle" | "high" | null;

const gradesBySchool = {
  primary: [1, 2, 3, 4, 5],
  middle: [6, 7, 8],
  high: [9, 10, 11, 12],
};

const StudentSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [schoolType, setSchoolType] = useState<SchoolType>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const totalSteps = 2;

  const handleComplete = () => {
    toast.success("Welcome! Your workspace is ready.");
    navigate("/student/dashboard");
  };

  const canProceed = () => {
    switch (step) {
      case 1: return schoolType !== null;
      case 2: return selectedGrade !== null;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme-aware Background */}
      <ThemeBackground variant="dark" overlay="medium" />
      
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-panel-strong rounded-3xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center">
              <Users className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Student Setup</h1>
              <p className="text-muted-foreground text-sm">Tell us about yourself</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i < step ? "bg-primary" : i === step - 1 ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step 1: School Type */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                  Select Your School Level
                </h2>
                <p className="text-muted-foreground text-sm">
                  What type of school are you in?
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: "primary" as const, label: "Primary", grades: "1-5" },
                  { type: "middle" as const, label: "Middle", grades: "6-8" },
                  { type: "high" as const, label: "High", grades: "9-12" },
                ].map((school) => (
                  <button
                    key={school.type}
                    onClick={() => {
                      setSchoolType(school.type);
                      setSelectedGrade(null);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      schoolType === school.type
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                  >
                    <School className={`w-10 h-10 mx-auto mb-3 ${schoolType === school.type ? "text-primary" : "text-muted-foreground"}`} />
                    <p className={`font-semibold ${schoolType === school.type ? "text-foreground" : "text-muted-foreground"}`}>
                      {school.label}
                    </p>
                    <p className="text-xs text-muted-foreground">Grades {school.grades}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Grade Selection */}
          {step === 2 && schoolType && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                  Select Your Grade
                </h2>
                <p className="text-muted-foreground text-sm">
                  Which grade are you in?
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                {gradesBySchool[schoolType].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`w-20 h-20 rounded-2xl border-2 font-display text-2xl font-bold transition-all duration-300 ${
                      selectedGrade === grade
                        ? "border-primary bg-primary text-primary-foreground shadow-glow"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                variant="hero"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="hero"
                onClick={handleComplete}
                disabled={!canProceed()}
              >
                Start Learning
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentSetup;
