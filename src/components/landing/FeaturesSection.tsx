import { motion } from "framer-motion";
import { 
  Brain, 
  Users, 
  BarChart3, 
  BookOpen, 
  Sparkles, 
  Clock,
  GraduationCap,
  Target
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Tutoring",
    description: "Personalized learning experiences that adapt to each student's pace and understanding level.",
    color: "from-primary to-accent",
  },
  {
    icon: BookOpen,
    title: "Smart Quiz Generator",
    description: "Create curriculum-aligned quizzes instantly with AI. Supports MCQ, essay, and open-ended formats.",
    color: "from-accent to-secondary",
  },
  {
    icon: BarChart3,
    title: "Intelligent Analytics",
    description: "Track progress, identify weak areas, and get actionable insights for every student.",
    color: "from-secondary to-primary",
  },
  {
    icon: Users,
    title: "Class Management",
    description: "Organize grades, sections, and students effortlessly. Manage multiple classes from one dashboard.",
    color: "from-primary to-accent",
  },
  {
    icon: Target,
    title: "Learning Objectives",
    description: "AI-suggested objectives aligned with curriculum standards. Fully customizable by teachers.",
    color: "from-accent to-secondary",
  },
  {
    icon: Clock,
    title: "Smart Timetables",
    description: "Auto-generated balanced schedules for students based on subjects and learning goals.",
    color: "from-secondary to-primary",
  },
];

const teacherBenefits = [
  "Create lessons and quizzes in seconds",
  "Track all students' progress in real-time",
  "AI-powered grading assistance",
  "Curriculum-aligned content generation",
];

const studentBenefits = [
  "Personalized learning paths",
  "Interactive AI tutor available 24/7",
  "Adaptive difficulty levels",
  "Progress tracking & achievements",
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            FEATURES
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Everything You Need for{" "}
            <span className="text-gradient">Smart Learning</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful tools designed for teachers and students to create an 
            engaging and effective learning environment.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel rounded-2xl p-6 hover-lift group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow duration-300`}>
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Benefits for Teachers & Students */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Teacher Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-panel-strong rounded-3xl p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">For Teachers</h3>
                <p className="text-muted-foreground text-sm">Powerful tools to enhance teaching</p>
              </div>
            </div>
            <ul className="space-y-4">
              {teacherBenefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-success" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Student Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-panel-strong rounded-3xl p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-secondary flex items-center justify-center">
                <Users className="w-7 h-7 text-foreground" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">For Students</h3>
                <p className="text-muted-foreground text-sm">Personalized learning experience</p>
              </div>
            </div>
            <ul className="space-y-4">
              {studentBenefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
