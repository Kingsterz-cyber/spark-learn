import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, ArrowRight, Users } from "lucide-react";
import { toast } from "sonner";
import bgGradientDark from "@/assets/bg-gradient-dark.jpg";

type UserRole = "teacher" | "student" | null;

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error("Please select your role (Teacher or Student)");
      return;
    }

    setIsLoading(true);
    
    // Simulate signup - replace with actual auth
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Account created successfully!");
      navigate(selectedRole === "teacher" ? "/teacher/setup" : "/student/setup");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgGradientDark})` }}
      />
      <div className="absolute inset-0 bg-background/60" />
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel-strong rounded-3xl p-8">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              Smart<span className="text-gradient">Learning</span>
            </span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Create Your Account
            </h1>
            <p className="text-muted-foreground">
              Join thousands of learners and educators
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <Label className="text-foreground mb-3 block">I am a...</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("teacher")}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedRole === "teacher"
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border bg-muted/30 hover:border-primary/50"
                }`}
              >
                <GraduationCap className={`w-8 h-8 mx-auto mb-2 ${selectedRole === "teacher" ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`font-medium ${selectedRole === "teacher" ? "text-foreground" : "text-muted-foreground"}`}>
                  Teacher
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("student")}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedRole === "student"
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border bg-muted/30 hover:border-primary/50"
                }`}
              >
                <Users className={`w-8 h-8 mx-auto mb-2 ${selectedRole === "student" ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`font-medium ${selectedRole === "student" ? "text-foreground" : "text-muted-foreground"}`}>
                  Student
                </span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 bg-muted/50 border-border focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-muted/50 border-border focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 bg-muted/50 border-border focus:border-primary"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-sm">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Sign In Link */}
          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
