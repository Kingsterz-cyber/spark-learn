import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "High School Teacher",
    school: "Lincoln High School",
    content: "Smart Learning has revolutionized how I create assessments. What used to take hours now takes minutes. The AI-generated quizzes are perfectly aligned with our curriculum.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Middle School Student",
    school: "Grade 7",
    content: "I love how the AI tutor explains things in a way I can understand. It's like having a personal teacher available 24/7. My grades have improved so much!",
    rating: 5,
  },
  {
    name: "Dr. Emily Roberts",
    role: "School Principal",
    school: "Oakwood Academy",
    content: "The analytics dashboard gives us unprecedented insight into student performance. We can identify struggling students early and provide targeted support.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
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
            <Star className="w-4 h-4" />
            TESTIMONIALS
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Loved by{" "}
            <span className="text-gradient">Educators & Students</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what our community has to say about their experience with Smart Learning.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel-strong rounded-3xl p-8 hover-lift relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-primary/20">
                <Quote className="w-10 h-10" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.school}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
