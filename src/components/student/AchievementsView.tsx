import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Flame, 
  Zap,
  Target,
  Crown,
  Medal,
  Award,
  Sparkles,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { useStudentData } from '@/hooks/useStudentData';
import confetti from 'canvas-confetti';

// Badge icon mapping
const badgeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  flame: Flame,
  zap: Zap,
  target: Target,
  crown: Crown,
  medal: Medal,
  award: Award,
  trophy: Trophy,
};

const AchievementsView = () => {
  const { gamification, badges, earnedBadges } = useStudentData();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate level from XP
  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 100) + 1;
  };

  const level = calculateLevel(gamification?.total_xp || 0);
  const xpForCurrentLevel = (gamification?.total_xp || 0) % 100;
  const xpForNextLevel = 100;

  // Trigger celebration on mount if there are new achievements
  useEffect(() => {
    if (earnedBadges.length > 0) {
      // Check if any badge was earned today
      const today = new Date().toISOString().split('T')[0];
      const newBadges = earnedBadges.filter(b => b.earned_at?.startsWith(today));
      if (newBadges.length > 0) {
        setShowCelebration(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  }, [earnedBadges]);

  const getBadgeIcon = (iconName: string) => {
    return badgeIcons[iconName] || Trophy;
  };

  const isBadgeEarned = (badgeId: string) => {
    return earnedBadges.some(b => b.id === badgeId);
  };

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    const category = badge.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, typeof badges>);

  // Stats cards
  const stats = [
    { 
      label: "Level", 
      value: level, 
      icon: Crown, 
      color: "text-warning",
      subtext: `${xpForCurrentLevel}/${xpForNextLevel} XP to next level`
    },
    { 
      label: "Total XP", 
      value: gamification?.total_xp || 0, 
      icon: Sparkles, 
      color: "text-primary",
      subtext: "Experience points earned"
    },
    { 
      label: "Current Streak", 
      value: `${gamification?.current_streak || 0} days`, 
      icon: Flame, 
      color: "text-destructive",
      subtext: `Longest: ${gamification?.longest_streak || 0} days`
    },
    { 
      label: "Badges Earned", 
      value: `${earnedBadges.length}/${badges.length}`, 
      icon: Trophy, 
      color: "text-success",
      subtext: "Collection progress"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="text-center"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow-strong animate-pulse">
                <Trophy className="w-16 h-16 text-primary-foreground" />
              </div>
              <h2 className="font-display text-4xl font-bold text-foreground mb-2">
                Achievement Unlocked!
              </h2>
              <p className="text-xl text-muted-foreground">
                Congratulations on your progress!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold text-foreground">Achievements</h1>
        <p className="text-muted-foreground">Track your milestones and rewards</p>
      </motion.div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong rounded-2xl p-6 border border-warning/30"
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            <motion.div 
              className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow"
              animate={{ 
                boxShadow: [
                  "0 0 20px hsl(var(--primary) / 0.3)",
                  "0 0 40px hsl(var(--primary) / 0.5)",
                  "0 0 20px hsl(var(--primary) / 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="font-display text-4xl font-bold text-primary-foreground">{level}</span>
            </motion.div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-warning flex items-center justify-center border-4 border-background">
              <Crown className="w-4 h-4 text-warning-foreground" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl font-bold text-foreground">Level {level}</h2>
              <span className="text-sm text-muted-foreground">Level {level + 1}</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden mb-2">
              <motion.div 
                className="h-full bg-gradient-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(xpForCurrentLevel / xpForNextLevel) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {xpForNextLevel - xpForCurrentLevel} XP needed for next level
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
            <p className="text-xs text-muted-foreground/60 mt-1">{stat.subtext}</p>
          </motion.div>
        ))}
      </div>

      {/* Streak Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Streak Calendar</h3>
          <div className="flex items-center gap-2 text-destructive">
            <Flame className="w-5 h-5" />
            <span className="font-bold">{gamification?.current_streak || 0} Day Streak</span>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 28 }).map((_, index) => {
            // Simulate streak data - in real app, this would come from actual activity data
            const isActive = index >= (28 - (gamification?.current_streak || 0));
            const isToday = index === 27;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.01 }}
                className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                  isToday 
                    ? 'bg-primary ring-2 ring-primary/50' 
                    : isActive 
                      ? 'bg-success/80' 
                      : 'bg-muted/50'
                }`}
              >
                {isActive && (
                  <Flame className={`w-4 h-4 ${isToday ? 'text-primary-foreground' : 'text-success-foreground'}`} />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Badges Collection */}
      {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-4 capitalize">
            {category} Badges
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {categoryBadges.map((badge, index) => {
              const earned = isBadgeEarned(badge.id);
              const BadgeIcon = getBadgeIcon(badge.icon);
              
              return (
                <motion.button
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBadge(badge)}
                  className={`relative p-4 rounded-xl transition-all ${
                    earned 
                      ? 'bg-gradient-primary shadow-glow' 
                      : 'bg-muted/50 opacity-50 grayscale'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      earned ? 'bg-primary-foreground/20' : 'bg-muted'
                    }`}>
                      <BadgeIcon className={`w-6 h-6 ${earned ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <p className={`text-xs font-medium ${earned ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                      {badge.name}
                    </p>
                    <p className={`text-[10px] ${earned ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>
                      {badge.xp_required} XP
                    </p>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="absolute -top-1 -right-1">
                    {earned ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-panel-strong rounded-2xl p-8 max-w-sm w-full text-center"
            >
              {(() => {
                const earned = isBadgeEarned(selectedBadge.id);
                const BadgeIcon = getBadgeIcon(selectedBadge.icon);
                
                return (
                  <>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                      earned ? 'bg-gradient-primary shadow-glow' : 'bg-muted'
                    }`}>
                      <BadgeIcon className={`w-12 h-12 ${earned ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      {selectedBadge.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedBadge.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Requires {selectedBadge.xp_required} XP</span>
                    </div>
                    {earned && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-success flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Earned {earnedBadges.find(b => b.id === selectedBadge.id)?.earned_at?.split('T')[0]}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementsView;
