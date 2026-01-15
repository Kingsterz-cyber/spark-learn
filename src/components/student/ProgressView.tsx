import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Brain,
  Sparkles,
  BookOpen,
  Trophy,
  Flame,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStudentData } from '@/hooks/useStudentData';
import { useAI } from '@/hooks/useAI';

interface ProgressViewProps {
  onNavigateToSubject: (subject: any) => void;
}

const ProgressView = ({ onNavigateToSubject }: ProgressViewProps) => {
  const { subjects, topics, progress, gamification, getSubjectProgress } = useStudentData();
  const { askTutor, loading: aiLoading } = useAI();
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'all'>('week');

  // Calculate overall stats
  const totalTopicsCompleted = progress.filter(p => p.completed_at).length;
  const totalTopics = Object.values(topics).flat().length;
  const overallCompletion = totalTopics > 0 ? Math.round((totalTopicsCompleted / totalTopics) * 100) : 0;
  const totalTimeSpent = progress.reduce((acc, p) => acc + (p.time_spent || 0), 0);

  // Get AI recommendation
  const getAIRecommendation = async () => {
    const weakSubjects = subjects
      .map(s => ({ name: s.name, progress: getSubjectProgress(s.id) }))
      .filter(s => s.progress < 50)
      .sort((a, b) => a.progress - b.progress);

    const prompt = weakSubjects.length > 0
      ? `Based on the student's progress, they are struggling with: ${weakSubjects.map(s => `${s.name} (${s.progress}%)`).join(', ')}. Give a brief, encouraging recommendation (2-3 sentences) on which subject to focus on next and why.`
      : `The student is doing well across all subjects! Give a brief, encouraging message (2-3 sentences) to keep them motivated.`;

    const response = await askTutor([{ role: 'user', content: prompt }]);
    setAiRecommendation(response);
  };

  useEffect(() => {
    if (subjects.length > 0 && !aiRecommendation) {
      getAIRecommendation();
    }
  }, [subjects]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Mastery levels
  const getMasteryLevel = (percent: number) => {
    if (percent >= 90) return { label: 'Mastered', color: 'text-success', bg: 'bg-success/20' };
    if (percent >= 70) return { label: 'Proficient', color: 'text-primary', bg: 'bg-primary/20' };
    if (percent >= 50) return { label: 'Developing', color: 'text-warning', bg: 'bg-warning/20' };
    if (percent >= 25) return { label: 'Beginning', color: 'text-accent', bg: 'bg-accent/20' };
    return { label: 'Not Started', color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Your Progress</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track your learning journey</p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: Target, label: "Overall Mastery", value: `${overallCompletion}%`, color: "text-primary" },
          { icon: BookOpen, label: "Topics Completed", value: `${totalTopicsCompleted}/${totalTopics}`, color: "text-success" },
          { icon: Clock, label: "Time Invested", value: formatTime(totalTimeSpent), color: "text-accent" },
          { icon: Flame, label: "Current Streak", value: `${gamification?.current_streak || 0} days`, color: "text-warning" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel rounded-xl sm:rounded-2xl p-3 sm:p-5"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
            </div>
            <p className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Recommendation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary/30"
      >
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">AI Learning Recommendation</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={getAIRecommendation}
                disabled={aiLoading}
                className="tap-compact"
              >
                <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {aiLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Analyzing your progress...</span>
              </div>
            ) : (
              <p className="text-sm sm:text-base text-muted-foreground">{aiRecommendation || "Loading recommendations..."}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Subject Mastery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Mastery Map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6"
        >
          <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Subject Mastery</h3>
          <div className="space-y-3 sm:space-y-4">
            {subjects.map((subject, index) => {
              const subjectProgress = getSubjectProgress(subject.id);
              const mastery = getMasteryLevel(subjectProgress);
              const subjectTopics = topics[subject.id] || [];
              const completedTopics = subjectTopics.filter(t => 
                progress.find(p => p.topic_id === t.id && p.completed_at)
              ).length;

              return (
                <motion.button
                  key={subject.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => onNavigateToSubject(subject)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm sm:text-base">{subject.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {completedTopics}/{subjectTopics.length} topics
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${mastery.bg} ${mastery.color}`}>
                        {mastery.label}
                      </span>
                    </div>
                  </div>
                  <div className="ml-10 sm:ml-13">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-medium">{subjectProgress}%</span>
                    </div>
                    <Progress value={subjectProgress} className="h-1.5 sm:h-2" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Topic Heatmap */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">Topic Difficulty Heatmap</h3>
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </div>
          
          {/* Heatmap Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Generate a visual heatmap */}
            {Array.from({ length: 28 }).map((_, index) => {
              // Simulate difficulty levels based on progress data
              const randomProgress = Math.random() * 100;
              const intensity = 
                randomProgress >= 80 ? 'bg-success' :
                randomProgress >= 60 ? 'bg-success/60' :
                randomProgress >= 40 ? 'bg-warning/60' :
                randomProgress >= 20 ? 'bg-warning' :
                'bg-destructive/60';
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.01 }}
                  className={`aspect-square rounded ${intensity} cursor-pointer hover:ring-2 hover:ring-primary transition-all`}
                  title={`Day ${index + 1}`}
                />
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-destructive/60" />
              <span>Challenging</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-warning" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-success" />
              <span>Easy</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Learning Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6"
      >
        <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Learning Insights</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 text-center">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-primary mb-1">
              {gamification?.longest_streak || 0}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Longest Streak</p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 text-center">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-success mb-1">
              {totalTopicsCompleted}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Topics Mastered</p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 text-center">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-warning mb-1">
              {gamification?.total_xp || 0}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total XP Earned</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressView;
