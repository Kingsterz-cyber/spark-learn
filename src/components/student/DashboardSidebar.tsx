import { useState, useEffect } from 'react';
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
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [activeView, isMobile]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('dashboard-sidebar');
      if (sidebar && !sidebar.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

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

  const handleNavigate = (view: string) => {
    onNavigate(view);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const sidebarContent = (
    <>
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
          className="glass-panel rounded-xl p-3 sm:p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg">
                {studentName.charAt(0).toUpperCase()}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-success rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate text-sm sm:text-base">{studentName}</p>
              <p className="text-xs text-muted-foreground">{gradeLevel}</p>
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="35%"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="35%"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: `${overallProgress} 100` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-primary">
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
              onClick={() => handleNavigate(item.view)}
              onMouseEnter={() => setIsHovered(item.view)}
              onMouseLeave={() => setIsHovered(null)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl transition-all relative group ${
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
              
              <Icon className={`w-5 h-5 transition-transform flex-shrink-0 ${isHovered === item.view ? 'scale-110' : ''}`} />
              <span className="flex-1 text-left text-sm sm:text-base">{item.label}</span>
              
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
              
              <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} />
            </motion.button>
          );
        })}
      </nav>

      {/* AI Assistant Quick Access */}
      <div className="p-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavigate('ai-tutor')}
          className="w-full p-3 rounded-xl bg-gradient-primary text-primary-foreground flex items-center gap-3 shadow-glow"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-semibold">AI Tutor</p>
            <p className="text-xs opacity-80">Ask anything</p>
          </div>
        </motion.button>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 space-y-1 border-t border-border safe-area-bottom">
        <button className="w-full flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">Settings</span>
        </button>
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">Log Out</span>
        </button>
      </div>
    </>
  );

  // Mobile: Hamburger menu + drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-xl glass-panel-strong"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Drawer */}
              <motion.aside
                id="dashboard-sidebar"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 h-screen w-[280px] max-w-[85vw] glass-panel-strong border-r border-border flex flex-col z-50 safe-area-top"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
                
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <aside 
      id="dashboard-sidebar"
      className="fixed left-0 top-0 h-screen w-64 glass-panel-strong border-r border-border flex flex-col z-40"
    >
      {sidebarContent}
    </aside>
  );
};

export default DashboardSidebar;
