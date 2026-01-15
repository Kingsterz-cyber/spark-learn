import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  Brain,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStudentData } from '@/hooks/useStudentData';
import { useAI } from '@/hooks/useAI';
import LessonViewer from './LessonViewer';
import PracticeMode from './PracticeMode';
import QuizMode from './QuizMode';

interface Topic {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  order_index: number;
  estimated_duration: number | null;
  subject_id: string;
}

interface SubjectWorkspaceProps {
  subject: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
  };
  onBack: () => void;
}

type ViewMode = 'overview' | 'lesson' | 'practice' | 'quiz';

const SubjectWorkspace = ({ subject, onBack }: SubjectWorkspaceProps) => {
  const { topics, progress, getSubjectProgress, getTopicStatus, fetchTopics } = useStudentData();
  const { askTutor, loading: aiLoading } = useAI();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [isTeacherPlaying, setIsTeacherPlaying] = useState(false);
  const [teacherMessage, setTeacherMessage] = useState('');

  const subjectTopics = topics[subject.id] || [];
  const subjectProgress = getSubjectProgress(subject.id);

  useEffect(() => {
    if (!topics[subject.id]) {
      fetchTopics(subject.id);
    }
  }, [subject.id]);

  const handlePlayTeacher = async () => {
    setIsTeacherPlaying(true);
    const message = await askTutor(
      [{ 
        role: 'user', 
        content: `Give me a brief, engaging introduction to ${subject.name}. What will I learn and why is it important? Keep it under 100 words.`
      }],
      undefined,
      subject.name
    );
    setTeacherMessage(message || `Welcome to ${subject.name}! Let's explore this fascinating subject together.`);
  };

  const handleTopicClick = (topic: Topic) => {
    const status = getTopicStatus(topic, subjectTopics);
    if (status === 'locked') return;
    setSelectedTopic(topic);
    setViewMode('lesson');
  };

  const getStatusIcon = (status: 'locked' | 'available' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />;
      case 'locked':
        return <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />;
      default:
        return <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
    }
  };

  const getTopicProgress = (topicId: string) => {
    const p = progress.find(pr => pr.topic_id === topicId);
    return p?.progress_percent || 0;
  };

  if (viewMode === 'lesson' && selectedTopic) {
    return (
      <LessonViewer
        topic={selectedTopic}
        subjectName={subject.name}
        onBack={() => setViewMode('overview')}
        onPractice={() => setViewMode('practice')}
        onComplete={() => setViewMode('overview')}
      />
    );
  }

  if (viewMode === 'practice' && selectedTopic) {
    return (
      <PracticeMode
        topic={selectedTopic}
        subjectName={subject.name}
        onBack={() => setViewMode('lesson')}
        onQuiz={() => setViewMode('quiz')}
      />
    );
  }

  if (viewMode === 'quiz' && selectedTopic) {
    return (
      <QuizMode
        topic={selectedTopic}
        subjectName={subject.name}
        onBack={() => setViewMode('overview')}
        onComplete={() => setViewMode('overview')}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{subject.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{subject.description || 'Master this subject step by step'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 ml-12 sm:ml-0">
          <div className="text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">Mastery</p>
            <p className="text-base sm:text-lg font-bold text-primary">{subjectProgress}%</p>
          </div>
          <div className="w-16 h-16 sm:w-24 sm:h-24 relative flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${subjectProgress * 2.51} 251`}
              />
            </svg>
            <Target className="w-5 h-5 sm:w-8 sm:h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </motion.div>

      {/* AI Teacher Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              onClick={handlePlayTeacher}
              disabled={aiLoading}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow hover:scale-105 transition-transform disabled:opacity-50 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {aiLoading ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground ml-0.5 sm:ml-1" />
              )}
            </motion.button>
            <div>
              <h2 className="font-display text-base sm:text-lg font-semibold text-foreground">AI Teacher</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isTeacherPlaying ? 'Introducing this subject...' : 'Click play to hear an introduction'}
              </p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse hidden sm:block" />
        </div>
        
        <AnimatePresence>
          {teacherMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50"
            >
              <p className="text-sm sm:text-base text-foreground leading-relaxed">{teacherMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Learning Path */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Topics List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 glass-panel rounded-xl sm:rounded-2xl p-3 sm:p-4"
        >
          <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Learning Path</h3>
          <div className="space-y-2">
            {subjectTopics.map((topic, index) => {
              const status = getTopicStatus(topic, subjectTopics);
              const topicProgress = getTopicProgress(topic.id);
              
              return (
                <motion.button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  disabled={status === 'locked'}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all ${
                    status === 'locked' 
                      ? 'opacity-50 cursor-not-allowed bg-muted/30' 
                      : 'hover:bg-muted cursor-pointer'
                  } ${selectedTopic?.id === topic.id ? 'bg-primary/20 border border-primary/50' : ''}`}
                  whileHover={status !== 'locked' ? { x: 4 } : undefined}
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(status)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-xs sm:text-sm font-medium truncate ${status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {topic.title}
                    </p>
                    {status !== 'locked' && topicProgress > 0 && (
                      <Progress value={topicProgress} className="h-1 mt-1" />
                    )}
                  </div>
                  {status !== 'locked' && (
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </motion.button>
              );
            })}
            
            {subjectTopics.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No topics available yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Content Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6"
        >
          {selectedTopic ? (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">{selectedTopic.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{selectedTopic.description}</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{selectedTopic.estimated_duration || 30} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{getTopicProgress(selectedTopic.id)}% complete</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <Button
                  variant="default"
                  className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 sm:py-4 text-xs sm:text-sm"
                  onClick={() => setViewMode('lesson')}
                >
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Lesson</span>
                </Button>
                <Button
                  variant="secondary"
                  className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 sm:py-4 text-xs sm:text-sm"
                  onClick={() => setViewMode('practice')}
                >
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Practice</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 sm:py-4 text-xs sm:text-sm"
                  onClick={() => setViewMode('quiz')}
                >
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Quiz</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50" />
              <p className="text-base sm:text-lg font-medium">Select a topic to begin</p>
              <p className="text-xs sm:text-sm">Choose from the learning path</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SubjectWorkspace;
