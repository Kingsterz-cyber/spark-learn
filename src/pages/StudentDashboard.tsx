import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Sparkles,
  Clock,
  Trophy,
  Target,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  MessageCircle,
  Flame
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import AITutorChat from "@/components/AITutorChat";
import SubjectWorkspace from "@/components/student/SubjectWorkspace";
import { useStudentData } from "@/hooks/useStudentData";
import { useAuth } from "@/hooks/useAuth";

type DashboardView = 'home' | 'subjects' | 'quizzes' | 'timetable' | 'progress' | 'achievements';

const StudentDashboard = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>('home');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const { subjects, gamification, earnedBadges, loading, getSubjectProgress, topics } = useStudentData();
  const { profile, signOut } = useAuth();

  // Navigation items
  const navItems = [
    { icon: BookOpen, label: "My Subjects", view: 'subjects' as DashboardView, active: activeView === 'subjects' || activeView === 'home' },
    { icon: FileText, label: "Quizzes", view: 'quizzes' as DashboardView },
    { icon: Clock, label: "Timetable", view: 'timetable' as DashboardView },
    { icon: BarChart3, label: "Progress", view: 'progress' as DashboardView },
    { icon: Trophy, label: "Achievements", view: 'achievements' as DashboardView },
  ];

  const stats = [
    { label: "Total XP", value: gamification?.total_xp || 0, icon: Sparkles, color: "text-primary" },
    { label: "Current Streak", value: `${gamification?.current_streak || 0} days`, icon: Flame, color: "text-warning" },
    { label: "Badges Earned", value: earnedBadges.length, icon: Trophy, color: "text-accent" },
    { label: "Subjects", value: subjects.length, icon: BookOpen, color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 glass-panel-strong border-r border-border p-4 flex flex-col z-40">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            Smart<span className="text-gradient">Learning</span>
          </span>
        </Link>

        {/* Student Info */}
        <div className="glass-panel rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center text-foreground font-bold text-lg">
              S
            </div>
            <div>
              <p className="font-semibold text-foreground">Student</p>
              <p className="text-xs text-muted-foreground">Grade 6 • Middle School</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="text-primary">70%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary rounded-full" style={{ width: "70%" }} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { setActiveView(item.view); setSelectedSubject(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                item.active
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-1 pt-4 border-t border-border">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Good morning, {profile?.full_name || 'Student'}!
            </h1>
            <p className="text-muted-foreground">
              {gamification?.current_streak ? `🔥 ${gamification.current_streak} day streak!` : 'Ready to continue learning?'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center text-foreground font-bold">
              S
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="col-span-2 space-y-6">
            {/* AI Tutor Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel-strong rounded-3xl p-6 border border-primary/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
                    <Sparkles className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">AI Tutor</h2>
                    <p className="text-sm text-muted-foreground">Get help with any subject instantly</p>
                  </div>
                </div>
                <Button variant="hero" onClick={() => setIsChatOpen(true)}>
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
              className="glass-panel rounded-2xl p-6"
            >
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">My Subjects</h2>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : subjects.length > 0 ? (
                  subjects.map((subject) => {
                    const progress = getSubjectProgress(subject.id);
                    const topicCount = topics[subject.id]?.length || 0;
                    return (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubject(subject)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-foreground">{subject.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {topicCount} topics
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{progress}%</p>
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-primary rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-8">No subjects available yet</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-foreground">Today's Schedule</h2>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {timetable.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-12">{item.time}</span>
                    <div className="flex-1 p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium text-foreground">{item.subject}</p>
                      <p className="text-xs text-muted-foreground">{item.topic}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel rounded-2xl p-6"
            >
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Upcoming</h2>
              <div className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      task.type === "quiz" ? "bg-primary/20" :
                      task.type === "assignment" ? "bg-warning/20" : "bg-accent/20"
                    }`}>
                      <FileText className={`w-4 h-4 ${
                        task.type === "quiz" ? "text-primary" :
                        task.type === "assignment" ? "text-warning" : "text-accent"
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.due} • {task.subject}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* AI Tutor Chat */}
      <AITutorChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default StudentDashboard;
