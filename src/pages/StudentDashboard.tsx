import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Sparkles,
  Clock,
  ChevronRight,
  Bell,
  MessageCircle,
  Flame
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AITutorChat from "@/components/AITutorChat";
import DashboardSidebar from "@/components/student/DashboardSidebar";
import SubjectWorkspace from "@/components/student/SubjectWorkspace";
import ProgressView from "@/components/student/ProgressView";
import AchievementsView from "@/components/student/AchievementsView";
import QuizzesView from "@/components/student/QuizzesView";
import TimetableView from "@/components/student/TimetableView";
import { useStudentData } from "@/hooks/useStudentData";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

type DashboardView = 'home' | 'subjects' | 'quizzes' | 'timetable' | 'progress' | 'achievements' | 'ai-tutor';

const StudentDashboard = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>('home');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const { subjects, gamification, earnedBadges, loading, getSubjectProgress, topics, progress } = useStudentData();
  const { profile, signOut } = useAuth();
  const isMobile = useIsMobile();

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (subjects.length === 0) return 0;
    const totalProgress = subjects.reduce((acc, s) => acc + getSubjectProgress(s.id), 0);
    return Math.round(totalProgress / subjects.length);
  };

  const handleNavigate = (view: string) => {
    setActiveView(view as DashboardView);
    setSelectedSubject(null);
    if (view === 'ai-tutor') {
      setIsChatOpen(true);
    }
  };

  const gradeLevel = profile?.grade_level 
    ? profile.grade_level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Student';

  // Render the appropriate view based on activeView
  const renderContent = () => {
    // If a subject is selected, show the workspace
    if (selectedSubject) {
      return (
        <SubjectWorkspace
          subject={selectedSubject}
          onBack={() => setSelectedSubject(null)}
        />
      );
    }

    switch (activeView) {
      case 'progress':
        return <ProgressView onNavigateToSubject={setSelectedSubject} />;
      case 'achievements':
        return <AchievementsView />;
      case 'quizzes':
        return <QuizzesView />;
      case 'timetable':
        return <TimetableView />;
      case 'subjects':
      case 'home':
      default:
        return renderHomeView();
    }
  };

  const renderHomeView = () => (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: "Total XP", value: gamification?.total_xp || 0, icon: Sparkles, color: "text-primary" },
          { label: "Current Streak", value: `${gamification?.current_streak || 0} days`, icon: Flame, color: "text-warning" },
          { label: "Badges Earned", value: earnedBadges.length, icon: BookOpen, color: "text-accent" },
          { label: "Subjects", value: subjects.length, icon: BookOpen, color: "text-success" },
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
            </div>
            <p className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* AI Tutor Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-primary/30"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow flex-shrink-0">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">AI Tutor</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get help with any subject instantly</p>
                </div>
              </div>
              <Button variant="hero" onClick={() => setIsChatOpen(true)} className="w-full sm:w-auto">
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask AI Tutor
              </Button>
            </div>
          </motion.div>

          {/* Subjects Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6"
          >
            <h2 className="font-display text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">My Subjects</h2>
            <div className="space-y-3 sm:space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : subjects.length > 0 ? (
                subjects.map((subject) => {
                  const subjectProgress = getSubjectProgress(subject.id);
                  const topicCount = topics[subject.id]?.length || 0;
                  return (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject)}
                      className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground text-sm sm:text-base">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">{topicCount} topics</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-medium text-foreground">{subjectProgress}%</p>
                          <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-primary rounded-full transition-all"
                              style={{ width: `${subjectProgress}%` }}
                            />
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">No subjects available yet</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar - Hidden on mobile, shown on desktop */}
        <div className="space-y-4 sm:space-y-6">
          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="font-display text-base sm:text-lg font-semibold text-foreground">Today's Schedule</h2>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </div>
            <div className="space-y-2 sm:space-y-3">
              {[
                { time: "9:00", subject: "Mathematics", topic: "Fractions" },
                { time: "10:30", subject: "Science", topic: "Biology" },
                { time: "12:00", subject: "English", topic: "Writing" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs text-muted-foreground w-10 sm:w-12 flex-shrink-0">{item.time}</span>
                  <div className="flex-1 p-2 sm:p-3 rounded-lg bg-muted/50">
                    <p className="text-xs sm:text-sm font-medium text-foreground">{item.subject}</p>
                    <p className="text-xs text-muted-foreground">{item.topic}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-3 sm:mt-4 text-sm"
              onClick={() => setActiveView('timetable')}
            >
              View Full Schedule
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        studentName={profile?.full_name || 'Student'}
        gradeLevel={gradeLevel}
        overallProgress={calculateOverallProgress()}
        pendingQuizzes={2}
      />

      {/* Main Content */}
      <main className={`${isMobile ? 'pt-16 px-4 pb-6' : 'ml-64 p-6 lg:p-8'}`}>
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className={isMobile ? 'ml-10' : ''}>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              {activeView === 'home' || activeView === 'subjects' 
                ? `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}${!isMobile ? `, ${profile?.full_name || 'Student'}` : ''}!`
                : activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {gamification?.current_streak ? `🔥 ${gamification.current_streak} day streak!` : 'Ready to continue learning?'}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button className="relative p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base">
              {(profile?.full_name || 'S').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        {renderContent()}
      </main>

      {/* AI Tutor Chat */}
      <AITutorChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default StudentDashboard;
