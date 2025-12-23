import { motion } from "framer-motion";
import { Sparkles, Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How does the AI quiz generator work?",
    answer: "Our AI analyzes your curriculum, grade level, and subject to generate perfectly aligned quizzes. You can specify question types (MCQ, essay, true/false), difficulty levels, and topics. All generated content is fully editable before sharing with students.",
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. We use enterprise-grade encryption and comply with FERPA and GDPR regulations. Student data is never shared with third parties, and you maintain full control over your content.",
  },
  {
    question: "Can I try Smart Learning before committing?",
    answer: "Yes! Our Free plan lets you experience core features with up to 30 students and 5 AI-generated quizzes per month. Professional plan also includes a 14-day free trial.",
  },
  {
    question: "What grade levels does Smart Learning support?",
    answer: "We support Primary (Grades 1-5), Middle (Grades 6-8), and High School (Grades 9-12). Our AI adapts content complexity and tone based on the selected grade level.",
  },
  {
    question: "Can students access the platform on mobile devices?",
    answer: "Yes, Smart Learning is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. Students can access quizzes and lessons from any device.",
  },
  {
    question: "How do I get support if I need help?",
    answer: "Free users have access to email support and our comprehensive knowledge base. Professional users get priority support with faster response times. School plans include dedicated support representatives.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
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
            FAQ
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Frequently Asked{" "}
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Got questions? We've got answers.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-panel rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-display font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${openIndex === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {openIndex === index ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
              </button>
              
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
