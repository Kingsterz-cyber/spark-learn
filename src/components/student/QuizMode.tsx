import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  ChevronRight,
  Trophy,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import { useStudentData } from '@/hooks/useStudentData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';

interface Topic {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  order_index: number;
  estimated_duration: number | null;
  subject_id: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizModeProps {
  topic: Topic;
  subjectName: string;
  onBack: () => void;
  onComplete: () => void;
}

type QuizPhase = 'intro' | 'quiz' | 'results';

const QuizMode = ({ topic, subjectName, onBack, onComplete }: QuizModeProps) => {
  const { generateQuiz, askTutor } = useAI();
  const { updateProgress, addXP } = useStudentData();
  const { user, profile } = useAuth();
  const [phase, setPhase] = useState<QuizPhase>('intro');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [tabWarning, setTabWarning] = useState(false);

  // Disable copy/paste in quiz mode
  useEffect(() => {
    if (phase !== 'quiz') return;

    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);

    return () => {
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
    };
  }, [phase]);

  // Tab visibility detection
  useEffect(() => {
    if (phase !== 'quiz') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabWarning(true);
        setTimeout(() => setTabWarning(false), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [phase]);

  // Timer
  useEffect(() => {
    if (phase !== 'quiz' || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeRemaining]);

  const startQuiz = async () => {
    setIsLoading(true);
    const quiz = await generateQuiz(
      topic.content || topic.description || topic.title,
      topic.title,
      profile?.grade_level || undefined,
      5,
      'medium'
    );
    
    if (quiz) {
      setQuestions(quiz.questions);
      setPhase('quiz');
    }
    setIsLoading(false);
  };

  const handleSelectAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;
    
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      handleSubmitQuiz(newAnswers);
    }
  };

  const handleSubmitQuiz = useCallback(async (finalAnswers?: number[]) => {
    const answersToSubmit = finalAnswers || [...answers, selectedAnswer!];
    
    // Calculate score
    const correctCount = questions.reduce((acc, q, i) => {
      return acc + (answersToSubmit[i] === q.correctIndex ? 1 : 0);
    }, 0);
    const score = Math.round((correctCount / questions.length) * 100);
    
    // Save quiz attempt
    if (user) {
      // First, check if a quiz exists for this topic or create one
      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('topic_id', topic.id)
        .single();

      let quizId = existingQuiz?.id;

      if (!quizId) {
        // Quiz doesn't exist, we can't create one due to RLS
        // Just save the score locally for now
      } else {
        await supabase.from('quiz_attempts').insert({
          user_id: user.id,
          quiz_id: quizId,
          answers: answersToSubmit,
          score,
          completed_at: new Date().toISOString()
        });
      }
    }

    // Update progress
    await updateProgress(topic.id, 100);
    
    // Award XP based on score
    const xpEarned = Math.round(score / 5); // 0-20 XP
    await addXP(xpEarned);

    // Generate explanations for wrong answers
    const wrongQuestions = questions.filter((q, i) => answersToSubmit[i] !== q.correctIndex);
    if (wrongQuestions.length > 0) {
      const explanationPromises = wrongQuestions.map(q => 
        askTutor([{
          role: 'user',
          content: `Briefly explain why the correct answer to this question is correct: "${q.question}" - The answer is: ${q.options[q.correctIndex]}`
        }], profile?.grade_level || undefined, topic.title)
      );
      const results = await Promise.all(explanationPromises);
      setExplanations(results.filter(Boolean) as string[]);
    }

    setPhase('results');
    
    // Confetti for good scores
    if (score >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [answers, selectedAnswer, questions, user, topic, updateProgress, addXP, askTutor, profile]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const score = questions.length > 0 
    ? Math.round((answers.filter((a, i) => a === questions[i]?.correctIndex).length / questions.length) * 100)
    : 0;

  // Intro Phase
  if (phase === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto"
      >
        <div className="glass-panel-strong rounded-3xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Quiz: {topic.title}
          </h1>
          <p className="text-muted-foreground mb-6">{subjectName}</p>

          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-foreground">10 minutes time limit</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="text-foreground">5 questions • AI assistance disabled</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="w-5 h-5 text-success" />
              <span className="text-foreground">Focus mode enabled (no copy/paste)</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button variant="hero" onClick={startQuiz} disabled={isLoading}>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Start Quiz
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Quiz Phase
  if (phase === 'quiz') {
    const currentQuestion = questions[currentIndex];

    return (
      <div className="space-y-6">
        {/* Tab Warning */}
        <AnimatePresence>
          {tabWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-warning text-warning-foreground px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Please stay on this tab during the quiz</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground">{subjectName} • Quiz</p>
            <h1 className="font-display text-2xl font-bold text-foreground">{topic.title}</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Question</p>
              <p className="font-display text-xl font-bold text-foreground">
                {currentIndex + 1}/{questions.length}
              </p>
            </div>
            <div className={`text-center ${timeRemaining < 60 ? 'text-destructive' : ''}`}>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-display text-xl font-bold">
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-panel rounded-2xl p-8"
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">
              {currentQuestion?.question}
            </h2>

            <div className="space-y-3 mb-8">
              {currentQuestion?.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedAnswer === index
                      ? 'border-primary bg-primary/20'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      selectedAnswer === index ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-foreground">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNextQuestion} disabled={selectedAnswer === null}>
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Results Phase
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Score Card */}
      <div className="glass-panel-strong rounded-3xl p-8 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
          score >= 80 ? 'bg-gradient-primary' : score >= 60 ? 'bg-warning' : 'bg-destructive'
        }`}>
          {score >= 80 ? (
            <Trophy className="w-12 h-12 text-primary-foreground" />
          ) : (
            <Star className="w-12 h-12 text-primary-foreground" />
          )}
        </div>
        
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">{score}%</h1>
        <p className="text-muted-foreground mb-6">
          {score >= 80 ? 'Excellent work! You\'ve mastered this topic!' : 
           score >= 60 ? 'Good job! Keep practicing to improve.' :
           'Keep learning! Review the material and try again.'}
        </p>

        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">
              {answers.filter((a, i) => a === questions[i]?.correctIndex).length}
            </p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">
              {answers.filter((a, i) => a !== questions[i]?.correctIndex).length}
            </p>
            <p className="text-sm text-muted-foreground">Incorrect</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">+{Math.round(score / 5)}</p>
            <p className="text-sm text-muted-foreground">XP Earned</p>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Question Review</h3>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctIndex;
            return (
              <div key={i} className={`p-4 rounded-xl ${isCorrect ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{q.question}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your answer: {q.options[answers[i]]}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-success mt-1">
                        Correct answer: {q.options[q.correctIndex]}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Explanations */}
      {explanations.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">AI Learning Tips</h3>
          <div className="space-y-3">
            {explanations.map((exp, i) => (
              <div key={i} className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                <p className="text-foreground">{exp}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subject
        </Button>
        <Button variant="hero" onClick={onComplete}>
          Continue Learning
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default QuizMode;
