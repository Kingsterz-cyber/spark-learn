import { motion } from "framer-motion";
import { UserPlus, Settings, Sparkles, Rocket } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Sign Up & Choose Role",
    description: "Create your account and select whether you're a teacher or student.",
  },
  {
    step: 2,
    icon: Settings,
    title: "Set Up Your Workspace",
    description: "Configure your grades, subjects, and class sections in minutes.",
  },
  {
    step: 3,
    icon: Sparkles,
    title: "AI Does the Heavy Lifting",
    description: "Generate quizzes, lessons, and objectives with a single click.",
  },
  {
    step: 4,
    icon: Rocket,
    title: "Start Learning & Growing",
    description: "Track progress, get insights, and achieve learning goals.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
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
            HOW IT WORKS
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Get Started in{" "}
            <span className="text-gradient">4 Simple Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From signup to smart learning in minutes. Our AI handles the complexity.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className={`flex items-center gap-6 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Step Number */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                      <step.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{step.step}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 glass-panel rounded-2xl p-6 ${index % 2 === 1 ? 'md:text-right' : ''}`}>
                    <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 w-px h-8 bg-gradient-to-b from-primary/50 to-transparent hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
