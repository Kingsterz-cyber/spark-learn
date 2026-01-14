import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Play,
  Trophy,
  Target,
  ChevronRight,
  Filter,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentData } from '@/hooks/useStudentData';
import QuizMode from './QuizMode';

interface QuizzesViewProps {
  onStartQuiz?: (topic: any, subject: any) => void;
}

type QuizFilter = 'all' | 'assigned' | 'practice' | 'completed';

const QuizzesView = ({ onStartQuiz }: QuizzesViewProps) => {
  const { subjects, topics, quizAttempts, progress } = useStudentData();
  const [filter, setFilter] = useState<QuizFilter>('all');
  const [selectedQuizTopic, setSelectedQuizTopic] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  // Get all available quiz topics
  const getQuizTopics = () => {
    const allTopics: any[] = [];
    
    Object.entries(topics).forEach(([subjectId, subjectTopics]) => {
      const subject = subjects.find(s => s.id === subjectId);
      
      subjectTopics.forEach(topic => {
        const topicProgress = progress.find(p => p.topic_id === topic.id);
        const attempts = quizAttempts.filter(qa => 
          // In a real app, we'd match quiz_id to the topic's quiz
          // For now, we'll use progress as a proxy
          topicProgress && qa.quiz_id === topicProgress.topic_id
        );
        
        allTopics.push({
          ...topic,
          subject,
          subjectName: subject?.name || 'Unknown Subject',
          progress: topicProgress?.progress_percent || 0,
          completed: topicProgress?.completed_at ? true : false,
          attempts: attempts.length,
          bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.score || 0)) : null,
          lastAttempt: attempts[0]?.completed_at || null
        });
      });
    });
    
    return allTopics;
  };

  const quizTopics = getQuizTopics();

  // Filter quizzes
  const filteredQuizzes = quizTopics.filter(quiz => {
    switch (filter) {
      case 'assigned':
        return !quiz.completed && quiz.progress >= 50;
      case 'practice':
        return quiz.progress < 50;
      case 'completed':
        return quiz.completed;
      default:
        return true;
    }
  });

  // Stats
  const completedCount = quizTopics.filter(q => q.completed).length;
  const averageScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / quizAttempts.length)
    : 0;

  const filters: { value: QuizFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All Quizzes', count: quizTopics.length },
    { value: 'assigned', label: 'Assigned', count: quizTopics.filter(q => !q.completed && q.progress >= 50).length },
    { value: 'practice', label: 'Practice', count: quizTopics.filter(q => q.progress < 50).length },
    { value: 'completed', label: 'Completed', count: completedCount },
  ];

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const handleStartQuiz = (quiz: any) => {
    setSelectedQuizTopic(quiz);
    setSelectedSubject(quiz.subject);
  };

  // If a quiz is selected, show the quiz mode
  if (selectedQuizTopic && selectedSubject) {
    return (
      <QuizMode
        topic={selectedQuizTopic}
        subjectName={selectedSubject.name}
        onBack={() => {
          setSelectedQuizTopic(null);
          setSelectedSubject(null);
        }}
        onComplete={() => {
          setSelectedQuizTopic(null);
          setSelectedSubject(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge and track your progress</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: FileText, label: "Total Quizzes", value: quizTopics.length, color: "text-primary" },
          { icon: CheckCircle2, label: "Completed", value: completedCount, color: "text-success" },
          { icon: Target, label: "Average Score", value: `${averageScore}%`, color: "text-warning" },
          { icon: Trophy, label: "Total Attempts", value: quizAttempts.length, color: "text-accent" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2"
      >
        <Filter className="w-5 h-5 text-muted-foreground" />
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className="relative"
          >
            {f.label}
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
              filter === f.value ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {f.count}
            </span>
          </Button>
        ))}
      </motion.div>

      {/* Quizzes List */}
      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-panel rounded-2xl p-5 ${
                quiz.completed ? 'border border-success/30' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    quiz.completed ? 'bg-success/20' : 'bg-primary/20'
                  }`}>
                    {quiz.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : (
                      <FileText className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{quiz.title}</h3>
                    <p className="text-sm text-muted-foreground">{quiz.subjectName}</p>
                  </div>
                </div>
                
                {quiz.bestScore !== null && (
                  <div className="text-right">
                    <p className={`font-display text-2xl font-bold ${getScoreColor(quiz.bestScore)}`}>
                      {quiz.bestScore}%
                    </p>
                    <p className="text-xs text-muted-foreground">Best Score</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {quiz.estimated_duration || 10} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {quiz.attempts} attempts
                  </span>
                </div>
              </div>

              {/* Progress bar for practice quizzes */}
              {quiz.progress < 100 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Lesson Progress</span>
                    <span className="text-primary">{quiz.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-primary rounded-full transition-all"
                      style={{ width: `${quiz.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleStartQuiz(quiz)}
                className="w-full"
                variant={quiz.completed ? "outline" : "default"}
              >
                {quiz.completed ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </>
                ) : quiz.progress >= 50 ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Quiz
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Practice First
                  </>
                )}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredQuizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-2 text-center py-12"
          >
            <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No quizzes found
            </h3>
            <p className="text-muted-foreground">
              {filter === 'completed' 
                ? "You haven't completed any quizzes yet. Start learning!"
                : "No quizzes available in this category."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizzesView;
