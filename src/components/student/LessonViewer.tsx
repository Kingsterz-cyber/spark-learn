import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  Lightbulb,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import { useStudentData } from '@/hooks/useStudentData';
import { useAuth } from '@/hooks/useAuth';

interface Topic {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  order_index: number;
  estimated_duration: number | null;
  subject_id: string;
}

interface LessonViewerProps {
  topic: Topic;
  subjectName: string;
  onBack: () => void;
  onPractice: () => void;
  onComplete: () => void;
}

const LessonViewer = ({ topic, subjectName, onBack, onPractice, onComplete }: LessonViewerProps) => {
  const { askTutor, generateImage, loading: aiLoading } = useAI();
  const { updateProgress, addXP } = useStudentData();
  const { profile } = useAuth();
  const [lessonContent, setLessonContent] = useState<string>(topic.content || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Generate AI content if no content exists
    if (!topic.content) {
      generateLessonContent();
    }
  }, [topic.id]);

  const generateLessonContent = async () => {
    setIsGenerating(true);
    const gradeLevel = profile?.grade_level || 'high_school';
    
    const content = await askTutor(
      [{
        role: 'user',
        content: `Create a comprehensive lesson on "${topic.title}" for a ${gradeLevel.replace('_', ' ')} student studying ${subjectName}. 
        
Include:
1. A clear introduction
2. Key concepts explained simply
3. Real-world examples
4. Important points to remember

Format with clear headings and bullet points. Make it engaging and educational.`
      }],
      gradeLevel,
      `${subjectName}: ${topic.title}`
    );
    
    setLessonContent(content || `# ${topic.title}\n\nLesson content is being prepared...`);
    setIsGenerating(false);
  };

  const handleExplainDifferently = async () => {
    setIsGenerating(true);
    const content = await askTutor(
      [
        { role: 'assistant', content: lessonContent },
        { role: 'user', content: 'Can you explain this in a different way? Use simpler language, more examples, or a different approach.' }
      ],
      profile?.grade_level || undefined,
      `${subjectName}: ${topic.title}`
    );
    
    if (content) {
      setLessonContent(content);
    }
    setIsGenerating(false);
  };

  const handleGenerateIllustration = async () => {
    const url = await generateImage(
      `Educational illustration for ${topic.title} in ${subjectName}`,
      `${subjectName} education, ${topic.description || topic.title}`
    );
    if (url) {
      setIllustrationUrl(url);
    }
  };

  const handleComplete = async () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60); // minutes
    await updateProgress(topic.id, 50, timeSpent); // 50% for lesson, 100% after quiz
    await addXP(10); // XP for completing lesson
    setIsCompleted(true);
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="font-display text-2xl font-bold text-foreground mt-6 mb-3">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="font-display text-xl font-semibold text-foreground mt-5 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="font-display text-lg font-medium text-foreground mt-4 mb-2">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={i} className="ml-4 text-foreground flex items-start gap-2 mb-1">
            <span className="text-primary mt-1.5">•</span>
            <span>{line.slice(2)}</span>
          </li>
        );
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i} className="text-foreground leading-relaxed mb-2">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">{subjectName}</p>
            <h1 className="font-display text-2xl font-bold text-foreground">{topic.title}</h1>
          </div>
        </div>
        
        {isCompleted ? (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Completed! +10 XP</span>
          </div>
        ) : (
          <Button onClick={handleComplete} disabled={isGenerating}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        )}
      </motion.div>

      {/* AI Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExplainDifferently}
          disabled={isGenerating}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          Explain Differently
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateIllustration}
          disabled={aiLoading}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Generate Illustration
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={generateLessonContent}
          disabled={isGenerating}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-2xl p-8"
      >
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Generating lesson content...</p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            {renderContent(lessonContent)}
          </div>
        )}

        {illustrationUrl && (
          <div className="mt-6 rounded-xl overflow-hidden">
            <img src={illustrationUrl} alt={topic.title} className="w-full max-w-lg mx-auto" />
          </div>
        )}
      </motion.div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-xl p-4 flex items-start gap-3 border-l-4 border-primary"
      >
        <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Pro Tip</p>
          <p className="text-sm text-muted-foreground">
            After reading the lesson, try the practice mode to reinforce what you've learned. 
            AI hints are available during practice!
          </p>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between"
      >
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Topics
        </Button>
        <Button variant="hero" onClick={onPractice}>
          Continue to Practice
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};

export default LessonViewer;
