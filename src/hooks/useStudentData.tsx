import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Subject {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_public: boolean | null;
  created_by: string | null;
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  order_index: number;
  estimated_duration: number | null;
  subject_id: string;
}

interface StudentProgress {
  id: string;
  topic_id: string;
  progress_percent: number | null;
  completed_at: string | null;
  time_spent: number | null;
  last_accessed_at: string | null;
}

interface Gamification {
  id: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_required: number;
  category: string;
  earned_at?: string;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number | null;
  completed_at: string | null;
}

export const useStudentData = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Record<string, Topic[]>>({});
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all subjects
  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    
    if (error) throw error;
    setSubjects(data || []);
    return data || [];
  };

  // Fetch topics for a subject
  const fetchTopics = async (subjectId: string) => {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .order('order_index');
    
    if (error) throw error;
    setTopics(prev => ({ ...prev, [subjectId]: data || [] }));
    return data || [];
  };

  // Fetch student progress
  const fetchProgress = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    setProgress(data || []);
    return data || [];
  };

  // Fetch gamification data
  const fetchGamification = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('student_gamification')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    // Create gamification record if it doesn't exist
    if (!data) {
      const { data: newData, error: insertError } = await supabase
        .from('student_gamification')
        .insert({ user_id: user.id })
        .select()
        .single();
      
      if (insertError) throw insertError;
      setGamification(newData);
      return newData;
    }
    
    setGamification(data);
    return data;
  };

  // Fetch all badges and earned badges
  const fetchBadges = async () => {
    if (!user) return;
    
    const [badgesRes, earnedRes] = await Promise.all([
      supabase.from('badges').select('*').order('xp_required'),
      supabase.from('student_badges').select('*, badges(*)').eq('user_id', user.id)
    ]);
    
    if (badgesRes.error) throw badgesRes.error;
    if (earnedRes.error) throw earnedRes.error;
    
    setBadges(badgesRes.data || []);
    
    const earned = earnedRes.data?.map(eb => ({
      ...(eb.badges as Badge),
      earned_at: eb.earned_at
    })) || [];
    setEarnedBadges(earned);
  };

  // Fetch quiz attempts
  const fetchQuizAttempts = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setQuizAttempts(data || []);
    return data || [];
  };

  // Update progress for a topic
  const updateProgress = async (topicId: string, progressPercent: number, timeSpent?: number) => {
    if (!user) return;
    
    const existingProgress = progress.find(p => p.topic_id === topicId);
    
    if (existingProgress) {
      const { error } = await supabase
        .from('student_progress')
        .update({
          progress_percent: progressPercent,
          time_spent: (existingProgress.time_spent || 0) + (timeSpent || 0),
          last_accessed_at: new Date().toISOString(),
          completed_at: progressPercent >= 100 ? new Date().toISOString() : null
        })
        .eq('id', existingProgress.id);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('student_progress')
        .insert({
          user_id: user.id,
          topic_id: topicId,
          progress_percent: progressPercent,
          time_spent: timeSpent || 0,
          last_accessed_at: new Date().toISOString(),
          completed_at: progressPercent >= 100 ? new Date().toISOString() : null
        });
      
      if (error) throw error;
    }
    
    await fetchProgress();
    await updateStreak();
  };

  // Update streak and XP
  const updateStreak = async () => {
    if (!user || !gamification) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = gamification.last_activity_date;
    
    let newStreak = gamification.current_streak;
    
    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActivity === yesterdayStr) {
        newStreak += 1;
      } else if (lastActivity !== today) {
        newStreak = 1;
      }
      
      const { error } = await supabase
        .from('student_gamification')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, gamification.longest_streak),
          last_activity_date: today
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      await fetchGamification();
    }
  };

  // Add XP
  const addXP = async (amount: number) => {
    if (!user || !gamification) return;
    
    const newXP = gamification.total_xp + amount;
    
    const { error } = await supabase
      .from('student_gamification')
      .update({ total_xp: newXP })
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    // Check for new badges
    const unearned = badges.filter(b => 
      b.xp_required > 0 && 
      b.xp_required <= newXP && 
      !earnedBadges.find(eb => eb.id === b.id)
    );
    
    for (const badge of unearned) {
      await supabase.from('student_badges').insert({
        user_id: user.id,
        badge_id: badge.id
      });
    }
    
    await fetchGamification();
    await fetchBadges();
    
    return newXP;
  };

  // Calculate subject progress
  const getSubjectProgress = (subjectId: string) => {
    const subjectTopics = topics[subjectId] || [];
    if (subjectTopics.length === 0) return 0;
    
    const totalProgress = subjectTopics.reduce((acc, topic) => {
      const topicProgress = progress.find(p => p.topic_id === topic.id);
      return acc + (topicProgress?.progress_percent || 0);
    }, 0);
    
    return Math.round(totalProgress / subjectTopics.length);
  };

  // Get topic status (locked, available, completed)
  const getTopicStatus = (topic: Topic, allTopics: Topic[]): 'locked' | 'available' | 'in_progress' | 'completed' => {
    const topicProgress = progress.find(p => p.topic_id === topic.id);
    
    if (topicProgress?.completed_at) return 'completed';
    if (topicProgress && (topicProgress.progress_percent || 0) > 0) return 'in_progress';
    
    // First topic is always available
    if (topic.order_index === 0) return 'available';
    
    // Check if previous topic is completed
    const prevTopic = allTopics.find(t => t.order_index === topic.order_index - 1);
    if (!prevTopic) return 'available';
    
    const prevProgress = progress.find(p => p.topic_id === prevTopic.id);
    if (prevProgress?.completed_at) return 'available';
    
    return 'locked';
  };

  // Load all data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const subjectsData = await fetchSubjects();
        await Promise.all([
          fetchProgress(),
          fetchGamification(),
          fetchBadges(),
          fetchQuizAttempts(),
          ...subjectsData.map(s => fetchTopics(s.id))
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return {
    subjects,
    topics,
    progress,
    gamification,
    badges,
    earnedBadges,
    quizAttempts,
    loading,
    error,
    fetchSubjects,
    fetchTopics,
    updateProgress,
    addXP,
    getSubjectProgress,
    getTopicStatus,
    refetch: async () => {
      await Promise.all([
        fetchSubjects(),
        fetchProgress(),
        fetchGamification(),
        fetchBadges(),
        fetchQuizAttempts()
      ]);
    }
  };
};
