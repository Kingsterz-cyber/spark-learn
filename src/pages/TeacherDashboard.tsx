import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  BarChart3, 
  Sparkles,
  Plus,
  ChevronRight,
  FileText,
  Target,
  LogOut,
  Settings,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";

const TeacherDashboard = () => {
  const [activeClass, setActiveClass] = useState("2A");
  
  // Mock data
  const classes = [
    { id: "2A", grade: 2, section: "A", students: 25 },
    { id: "2B", grade: 2, section: "B", students: 28 },
    { id: "4B", grade: 4, section: "B", students: 22 },
  ];

  const subjects = ["Mathematics", "Science", "English", "History"];

  const recentActivity = [
    { type: "quiz", title: "Math Quiz - Fractions", date: "2 hours ago" },
    { type: "lesson", title: "Introduction to Photosynthesis", date: "Yesterday" },
    { type: "grade", title: "Graded 15 assignments", date: "Yesterday" },
  ];

  const stats = [
    { label: "Total Students", value: "75", icon: Users, color: "text-primary" },
    { label: "Lessons Created", value: "24", icon: BookOpen, color: "text-accent" },
    { label: "Quizzes Given", value: "18", icon: FileText, color: "text-success" },
    { label: "Avg. Score", value: "78%", icon: BarChart3, color: "text-warning" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 glass-panel-strong border-r border-border p-4 flex flex-col z-40">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            Smart<span className="text-gradient">Learning</span>
          </span>
        </Link>

        {/* Class Selector */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Classes</p>
          <div className="space-y-1">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setActiveClass(cls.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeClass === cls.id
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="font-medium">Grade {cls.grade}{cls.section}</span>
                <span className="text-xs">{cls.students} students</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {[
            { icon: Target, label: "Objectives", active: true },
            { icon: BookOpen, label: "Lessons" },
            { icon: FileText, label: "Quizzes" },
            { icon: Users, label: "Students" },
            { icon: BarChart3, label: "Analytics" },
          ].map((item) => (
            <button
              key={item.label}
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
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors">
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
              Welcome back, Teacher!
            </h1>
            <p className="text-muted-foreground">
              Manage your classes and track student progress
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              T
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
                <span className="text-xs text-muted-foreground">This month</span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="col-span-2 space-y-6">
            {/* AI Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel-strong rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">AI Assistant</h2>
                  <p className="text-sm text-muted-foreground">Generate content with AI</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Generate Quiz", icon: FileText },
                  { label: "Create Lesson", icon: BookOpen },
                  { label: "Suggest Objectives", icon: Target },
                  { label: "Analyze Marks", icon: BarChart3 },
                ].map((action) => (
                  <Button
                    key={action.label}
                    variant="glass"
                    className="h-auto flex-col gap-2 py-4"
                  >
                    <action.icon className="w-5 h-5" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Subjects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-foreground">Subjects</h2>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Subject
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{subject}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-2xl p-6"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.type === "quiz" ? "bg-primary/20" :
                    activity.type === "lesson" ? "bg-accent/20" : "bg-success/20"
                  }`}>
                    {activity.type === "quiz" && <FileText className="w-4 h-4 text-primary" />}
                    {activity.type === "lesson" && <BookOpen className="w-4 h-4 text-accent" />}
                    {activity.type === "grade" && <BarChart3 className="w-4 h-4 text-success" />}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
