import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Calendar,
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStudentData } from '@/hooks/useStudentData';
import { useAI } from '@/hooks/useAI';

interface TimetableEntry {
  id: string;
  time: string;
  subject: string;
  topic: string;
  duration: number;
  isAIGenerated?: boolean;
}

const TimetableView = () => {
  const { subjects, topics, progress, gamification } = useStudentData();
  const { askTutor, loading: aiLoading } = useAI();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState<Partial<TimetableEntry> | null>(null);

  // Generate AI timetable based on student's progress and weak areas
  const generateAITimetable = async () => {
    setIsGenerating(true);
    
    // Calculate weak areas
    const subjectProgress = subjects.map(s => ({
      name: s.name,
      progress: topics[s.id]?.reduce((acc, t) => {
        const p = progress.find(pr => pr.topic_id === t.id);
        return acc + (p?.progress_percent || 0);
      }, 0) / (topics[s.id]?.length || 1) || 0
    }));

    const weakSubjects = subjectProgress
      .filter(s => s.progress < 70)
      .sort((a, b) => a.progress - b.progress);

    const prompt = `Create a study schedule for today with 4-5 study sessions. 
    The student needs to focus more on these subjects (in order of priority): ${weakSubjects.map(s => s.name).join(', ') || 'all subjects equally'}.
    Current streak: ${gamification?.current_streak || 0} days.
    
    Return ONLY a JSON array with this format, no other text:
    [{"time": "9:00", "subject": "Subject Name", "topic": "Specific Topic", "duration": 45}]
    
    Make the schedule realistic with breaks and varied durations (30-60 minutes).`;

    const response = await askTutor([{ role: 'user', content: prompt }]);
    
    try {
      // Try to parse the JSON response
      const jsonMatch = response?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const entries: TimetableEntry[] = parsed.map((item: any, index: number) => ({
          id: `ai-${index}`,
          time: item.time,
          subject: item.subject,
          topic: item.topic,
          duration: item.duration,
          isAIGenerated: true
        }));
        setTimetable(entries);
      }
    } catch (e) {
      // Fallback to default schedule
      setTimetable([
        { id: '1', time: '9:00', subject: weakSubjects[0]?.name || 'Mathematics', topic: 'Review Session', duration: 45, isAIGenerated: true },
        { id: '2', time: '10:00', subject: weakSubjects[1]?.name || 'Science', topic: 'Practice Problems', duration: 45, isAIGenerated: true },
        { id: '3', time: '11:30', subject: weakSubjects[2]?.name || 'English', topic: 'Reading Comprehension', duration: 30, isAIGenerated: true },
        { id: '4', time: '14:00', subject: weakSubjects[0]?.name || 'Mathematics', topic: 'Quiz Practice', duration: 45, isAIGenerated: true },
      ]);
    }
    
    setIsGenerating(false);
  };

  // Initialize with default schedule
  useEffect(() => {
    if (timetable.length === 0 && subjects.length > 0) {
      generateAITimetable();
    }
  }, [subjects]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const addEntry = () => {
    setNewEntry({
      id: `new-${Date.now()}`,
      time: '12:00',
      subject: subjects[0]?.name || 'Subject',
      topic: 'New Topic',
      duration: 30
    });
  };

  const saveNewEntry = () => {
    if (newEntry) {
      setTimetable([...timetable, newEntry as TimetableEntry].sort((a, b) => 
        a.time.localeCompare(b.time)
      ));
      setNewEntry(null);
    }
  };

  const deleteEntry = (id: string) => {
    setTimetable(timetable.filter(t => t.id !== id));
  };

  const updateEntry = (id: string, updates: Partial<TimetableEntry>) => {
    setTimetable(timetable.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
    setEditingEntry(null);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const currentHour = new Date().getHours();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Timetable</h1>
          <p className="text-muted-foreground">Your personalized study schedule</p>
        </div>
        <Button
          variant="hero"
          onClick={generateAITimetable}
          disabled={isGenerating}
        >
          <Sparkles className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'AI Generate Schedule'}
        </Button>
      </motion.div>

      {/* Date Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-4 flex items-center justify-between"
      >
        <Button variant="ghost" size="icon" onClick={() => navigateDate('prev')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {formatDate(selectedDate)}
          </h2>
          {isToday && (
            <span className="text-sm text-primary">Today</span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigateDate('next')}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Timetable */}
      <div className="relative">
        {/* Time indicators */}
        <div className="absolute left-0 top-0 w-16 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className="h-20 flex items-start justify-end pr-3 text-sm text-muted-foreground"
            >
              {`${8 + i}:00`}
            </div>
          ))}
        </div>

        {/* Schedule Grid */}
        <div className="ml-20 space-y-2">
          <AnimatePresence>
            {timetable.map((entry, index) => {
              const hour = parseInt(entry.time.split(':')[0]);
              const isPast = isToday && hour < currentHour;
              const isCurrent = isToday && hour === currentHour;
              
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-panel rounded-xl p-4 relative group ${
                    isPast ? 'opacity-50' : ''
                  } ${isCurrent ? 'ring-2 ring-primary shadow-glow' : ''}`}
                >
                  {entry.isAIGenerated && (
                    <div className="absolute -top-2 -right-2">
                      <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI
                      </span>
                    </div>
                  )}

                  {editingEntry === entry.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <Input
                          value={entry.time}
                          onChange={(e) => updateEntry(entry.id, { time: e.target.value })}
                          placeholder="Time"
                          className="w-24"
                        />
                        <Input
                          value={entry.subject}
                          onChange={(e) => updateEntry(entry.id, { subject: e.target.value })}
                          placeholder="Subject"
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Input
                          value={entry.topic}
                          onChange={(e) => updateEntry(entry.id, { topic: e.target.value })}
                          placeholder="Topic"
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={entry.duration}
                          onChange={(e) => updateEntry(entry.id, { duration: parseInt(e.target.value) })}
                          placeholder="Duration"
                          className="w-24"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setEditingEntry(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={() => setEditingEntry(null)}>
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-display text-xl font-bold text-foreground">
                            {entry.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.duration} min
                          </p>
                        </div>
                        <div className="w-px h-12 bg-border" />
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{entry.subject}</p>
                            <p className="text-sm text-muted-foreground">{entry.topic}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => setEditingEntry(entry.id)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* New Entry Form */}
          <AnimatePresence>
            {newEntry && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-panel rounded-xl p-4 border-2 border-dashed border-primary/50"
              >
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input
                      value={newEntry.time}
                      onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
                      placeholder="Time (e.g., 14:00)"
                      className="w-32"
                    />
                    <Input
                      value={newEntry.subject}
                      onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                      placeholder="Subject"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Input
                      value={newEntry.topic}
                      onChange={(e) => setNewEntry({ ...newEntry, topic: e.target.value })}
                      placeholder="Topic"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={newEntry.duration}
                      onChange={(e) => setNewEntry({ ...newEntry, duration: parseInt(e.target.value) })}
                      placeholder="Duration (min)"
                      className="w-32"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setNewEntry(null)}>
                      Cancel
                    </Button>
                    <Button onClick={saveNewEntry}>
                      <Check className="w-4 h-4 mr-2" />
                      Add Entry
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Entry Button */}
          {!newEntry && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={addEntry}
              className="w-full p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Study Session
            </motion.button>
          )}
        </div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel rounded-2xl p-4"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Pro Tip</p>
            <p className="text-sm text-muted-foreground">
              The AI-generated schedule prioritizes subjects where you need the most practice. 
              You can edit or add sessions to customize your study plan.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimetableView;
