import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Clock, 
  BarChart3, 
  Trophy,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  view: string;
  badge?: number;
  badgeType?: 'new' | 'overdue' | 'info';
}

interface DashboardSidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  studentName: string;
  gradeLevel: string;
  overallProgress: number;
  pendingQuizzes?: number;
  overdueTasks?: number;
}

const DashboardSidebar = ({
  activeView,
  onNavigate,
  studentName,
  gradeLevel,
  overallProgress,
  pendingQuizzes = 0,
  overdueTasks = 0
}: DashboardSidebarProps) => {
  const { signOut } = useAuth();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const navItems: NavItem[] = [
    { 
      icon: BookOpen, 
      label: "My Subjects", 
      view: 'subjects'
    },
    { 
      icon: FileText, 
      label: "Quizzes", 
      view: 'quizzes',
      badge: pendingQuizzes,
      badgeType: 'new'
    },
    { 
      icon: Clock, 
      label: "Timetable", 
      view: 'timetable'
    },
    { 
      icon: BarChart3, 
      label: "Progress", 
      view: 'progress'
    },
    { 
      icon: Trophy, 
      label: "Achievements", 
      view: 'achievements'
    },
  ];

  const getBadgeColor = (type?: 'new' | 'overdue' | 'info') => {
    switch (type) {
      case 'new': return 'bg-primary text-primary-foreground';
      case 'overdue': return 'bg-warning text-warning-foreground';
      case 'info': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-panel-strong border-r border-border flex flex-col z-40">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 p-4 mb-2">
        <motion.div 
          className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow"
          whileHover={{ scale: 1.05 }}
        >
          <Users className="w-6 h-6 text-primary-foreground" />
        </motion.div>
        <span className="font-display text-lg font-bold text-foreground">
          Smart<span className="text-gradient">Learning</span>
        </span>
      </Link>

      {/* Student Info Card */}
      <div className="mx-4 mb-4">
        <motion.div 
          className="glass-panel rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                {studentName.charAt(0).toUpperCase()}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{studentName}</p>
              <p className="text-xs text-muted-foreground">{gradeLevel}</p>
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: `${overallProgress} 100` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">
                {overallProgress}%
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Overall Progress</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                <motion.div 
                  className="h-full bg-gradient-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item, index) => {
          const isActive = activeView === item.view || (activeView === 'home' && item.view === 'subjects');
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              onMouseEnter={() => setIsHovered(item.view)}
              onMouseLeave={() => setIsHovered(null)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group ${
                isActive
                  ? "bg-primary/20 text-primary shadow-glow"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {/* Active indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
              
              <Icon className={`w-5 h-5 transition-transform ${isHovered === item.view ? 'scale-110' : ''}`} />
              <span className="flex-1 text-left">{item.label}</span>
              
              {/* Badge */}
              {item.badge && item.badge > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${getBadgeColor(item.badgeType)}`}
                >
                  {item.badge}
                </motion.span>
              )}
              
              <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} />
            </motion.button>
          );
        })}
      </nav>

      {/* AI Assistant Quick Access */}
      <div className="p-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('ai-tutor')}
          className="w-full p-3 rounded-xl bg-gradient-primary text-primary-foreground flex items-center gap-3 shadow-glow"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold">AI Tutor</p>
            <p className="text-xs opacity-80">Ask anything</p>
          </div>
        </motion.button>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 space-y-1 border-t border-border">
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
  );
};

export default DashboardSidebar;
