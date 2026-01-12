import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2,
  XCircle,
  Lightbulb,
  ChevronRight,
  RefreshCw
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

interface PracticeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface PracticeModeProps {
  topic: Topic;
  subjectName: string;
  onBack: () => void;
  onQuiz: () => void;
}

const PracticeMode = ({ topic, subjectName, onBack, onQuiz }: PracticeModeProps) => {
  const { askTutor, generateQuiz, loading: aiLoading } = useAI();
  const { updateProgress, addXP } = useStudentData();
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generatePracticeQuestions();
  }, [topic.id]);

  const generatePracticeQuestions = async () => {
    setIsLoading(true);
    const quiz = await generateQuiz(
      topic.content || topic.description || topic.title,
      topic.title,
      profile?.grade_level || undefined,
      5,
      'easy'
    );
    
    if (quiz) {
      setQuestions(quiz.questions);
    }
    setIsLoading(false);
  };

  const handleGetHint = async () => {
    if (showHint) return;
    
    const currentQuestion = questions[currentIndex];
    const hintResponse = await askTutor(
      [{
        role: 'user',
        content: `Give me a helpful hint (without giving away the answer) for this question: "${currentQuestion.question}". The topic is ${topic.title} in ${subjectName}.`
      }],
      profile?.grade_level || undefined,
      topic.title
    );
    
    setHint(hintResponse || 'Think about the key concepts you learned in the lesson.');
    setShowHint(true);
  };

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    
    const isCorrect = selectedAnswer === questions[currentIndex].correctIndex;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      await addXP(5); // XP for correct answer
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
      setHint('');
    }
  };

  const handleComplete = async () => {
    const accuracy = (correctCount / questions.length) * 100;
    await updateProgress(topic.id, accuracy >= 70 ? 75 : 60); // 75% if good, 60% if needs work
    onQuiz();
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setHint('');
    setCorrectCount(0);
    generatePracticeQuestions();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Generating practice questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground mb-4">Failed to generate questions</p>
        <Button onClick={generatePracticeQuestions}>Try Again</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isComplete = currentIndex === questions.length - 1 && showResult;
  const accuracy = (correctCount / questions.length) * 100;

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
            <p className="text-sm text-muted-foreground">{subjectName} • Practice</p>
            <h1 className="font-display text-2xl font-bold text-foreground">{topic.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Practice Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-4 flex items-center gap-3 border-l-4 border-success"
      >
        <Sparkles className="w-5 h-5 text-success" />
        <p className="text-sm text-foreground">
          <span className="font-medium">Practice Mode:</span> AI hints are available! Take your time and learn from each question.
        </p>
      </motion.div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-panel rounded-2xl p-8"
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                let bgClass = 'bg-muted/50 hover:bg-muted';
                if (showResult) {
                  if (index === currentQuestion.correctIndex) {
                    bgClass = 'bg-success/20 border-success';
                  } else if (index === selectedAnswer) {
                    bgClass = 'bg-destructive/20 border-destructive';
                  }
                } else if (index === selectedAnswer) {
                  bgClass = 'bg-primary/20 border-primary';
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl border-2 border-transparent text-left transition-all ${bgClass}`}
                    whileHover={!showResult ? { scale: 1.01 } : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-foreground">{option}</span>
                      {showResult && index === currentQuestion.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-success ml-auto" />
                      )}
                      {showResult && index === selectedAnswer && index !== currentQuestion.correctIndex && (
                        <XCircle className="w-5 h-5 text-destructive ml-auto" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Hint Section */}
            <AnimatePresence>
              {showHint && hint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30"
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{hint}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result Explanation */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`mb-6 p-4 rounded-xl ${
                    selectedAnswer === currentQuestion.correctIndex 
                      ? 'bg-success/10 border border-success/30' 
                      : 'bg-destructive/10 border border-destructive/30'
                  }`}
                >
                  <p className="font-medium text-foreground mb-1">
                    {selectedAnswer === currentQuestion.correctIndex ? '🎉 Correct! +5 XP' : '❌ Not quite right'}
                  </p>
                  <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleGetHint}
                disabled={showHint || aiLoading || showResult}
              >
                <Lightbulb className={`w-4 h-4 mr-2 ${aiLoading ? 'animate-pulse' : ''}`} />
                Get Hint
              </Button>
              
              {!showResult ? (
                <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
                  Check Answer
                </Button>
              ) : currentIndex < questions.length - 1 ? (
                <Button onClick={handleNextQuestion}>
                  Next Question
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button variant="hero" onClick={handleComplete}>
                  Continue to Quiz
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-2xl p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Practice Complete!</h2>
            <p className="text-muted-foreground mb-6">
              You got {correctCount} out of {questions.length} correct ({Math.round(accuracy)}%)
            </p>
            
            {accuracy >= 70 ? (
              <p className="text-success mb-6">Great job! You're ready for the quiz!</p>
            ) : (
              <p className="text-warning mb-6">Keep practicing to improve your understanding.</p>
            )}

            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
              <Button variant="hero" onClick={handleComplete}>
                Continue to Quiz
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PracticeMode;
