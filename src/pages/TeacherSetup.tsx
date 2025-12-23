import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  GraduationCap, 
  School, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Plus,
  X
} from "lucide-react";
import bgGradientLight from "@/assets/bg-gradient-light.jpg";
import { toast } from "sonner";

type SchoolType = "primary" | "middle" | "high" | null;

const gradesBySchool = {
  primary: [1, 2, 3, 4, 5],
  middle: [6, 7, 8],
  high: [9, 10, 11, 12],
};

const suggestedSubjects = ["Mathematics", "Science", "English", "History", "Geography", "Art", "Music", "Physical Education"];

const TeacherSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [schoolType, setSchoolType] = useState<SchoolType>(null);
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [classSections, setClassSections] = useState<Record<number, string[]>>({});
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState("");

  const totalSteps = 4;

  const handleGradeToggle = (grade: number) => {
    setSelectedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  const handleAddSection = (grade: number, section: string) => {
    if (!section.trim()) return;
    setClassSections(prev => ({
      ...prev,
      [grade]: [...(prev[grade] || []), section.trim()]
    }));
  };

  const handleRemoveSection = (grade: number, section: string) => {
    setClassSections(prev => ({
      ...prev,
      [grade]: (prev[grade] || []).filter(s => s !== section)
    }));
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      setSelectedSubjects(prev => [...prev, customSubject.trim()]);
      setCustomSubject("");
    }
  };

  const handleComplete = () => {
    toast.success("Workspace created successfully!");
    navigate("/teacher/dashboard");
  };

  const canProceed = () => {
    switch (step) {
      case 1: return schoolType !== null;
      case 2: return selectedGrades.length > 0;
      case 3: return selectedGrades.every(g => (classSections[g]?.length || 0) > 0);
      case 4: return selectedSubjects.length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgGradientLight})` }}
      />
      <div className="absolute inset-0 bg-background/70" />
      
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="glass-panel-strong rounded-3xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Teacher Setup</h1>
              <p className="text-muted-foreground text-sm">Configure your workspace</p>
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
                  Select School Type
                </h2>
                <p className="text-muted-foreground text-sm">
                  Choose the level you teach at
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
                      setSelectedGrades([]);
                      setClassSections({});
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
                  Select Grades You Teach
                </h2>
                <p className="text-muted-foreground text-sm">
                  Choose one or more grades
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {gradesBySchool[schoolType].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => handleGradeToggle(grade)}
                    className={`w-16 h-16 rounded-xl border-2 font-display text-lg font-bold transition-all duration-300 ${
                      selectedGrades.includes(grade)
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

          {/* Step 3: Class Sections */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                  Create Class Sections
                </h2>
                <p className="text-muted-foreground text-sm">
                  Add sections for each grade (e.g., A, B, C)
                </p>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin pr-2">
                {selectedGrades.sort((a, b) => a - b).map((grade) => (
                  <div key={grade} className="glass-panel rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-foreground">Grade {grade}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Section name"
                          className="w-32 h-8 text-sm bg-muted/50"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddSection(grade, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            handleAddSection(grade, input.value);
                            input.value = "";
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(classSections[grade] || []).map((section) => (
                        <div
                          key={section}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm"
                        >
                          <span>{grade}{section}</span>
                          <button
                            onClick={() => handleRemoveSection(grade, section)}
                            className="hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(classSections[grade]?.length || 0) === 0 && (
                        <span className="text-muted-foreground text-sm">No sections added</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Subject Selection */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                  Select Subjects
                </h2>
                <p className="text-muted-foreground text-sm">
                  Choose subjects you teach or add custom ones
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {suggestedSubjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => handleSubjectToggle(subject)}
                    className={`px-4 py-2 rounded-xl border transition-all duration-300 ${
                      selectedSubjects.includes(subject)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {selectedSubjects.includes(subject) && <Check className="w-4 h-4 inline mr-1" />}
                    {subject}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom subject..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomSubject()}
                  className="bg-muted/50"
                />
                <Button variant="outline" onClick={handleAddCustomSubject}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {selectedSubjects.filter(s => !suggestedSubjects.includes(s)).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.filter(s => !suggestedSubjects.includes(s)).map((subject) => (
                    <div
                      key={subject}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm"
                    >
                      <span>{subject}</span>
                      <button
                        onClick={() => handleSubjectToggle(subject)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                Create Workspace
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherSetup;
