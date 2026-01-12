-- Student Gamification Tables

-- XP & Streaks tracking
CREATE TABLE public.student_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Badges/Achievements
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_required INTEGER DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student earned badges
CREATE TABLE public.student_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.student_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_gamification
CREATE POLICY "Users can view their own gamification" 
ON public.student_gamification 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gamification" 
ON public.student_gamification 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification" 
ON public.student_gamification 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for badges (viewable by all authenticated users)
CREATE POLICY "Anyone can view badges" 
ON public.badges 
FOR SELECT 
USING (true);

-- RLS Policies for student_badges
CREATE POLICY "Users can view their own badges" 
ON public.student_badges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges" 
ON public.student_badges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_student_gamification_updated_at
BEFORE UPDATE ON public.student_gamification
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, xp_required, category) VALUES
('First Steps', 'Complete your first lesson', 'footprints', 10, 'learning'),
('Quiz Starter', 'Complete your first quiz', 'brain', 50, 'quizzes'),
('Week Warrior', 'Maintain a 7-day streak', 'flame', 0, 'streaks'),
('Century Club', 'Earn 100 XP', 'trophy', 100, 'xp'),
('Knowledge Seeker', 'Complete 5 lessons', 'book-open', 150, 'learning'),
('Quiz Master', 'Score 100% on any quiz', 'award', 200, 'quizzes'),
('Month Champion', 'Maintain a 30-day streak', 'crown', 0, 'streaks'),
('XP Legend', 'Earn 500 XP', 'star', 500, 'xp'),
('Subject Expert', 'Complete all topics in a subject', 'graduation-cap', 300, 'learning'),
('Perfect Score', 'Get 5 perfect quiz scores', 'medal', 500, 'quizzes');