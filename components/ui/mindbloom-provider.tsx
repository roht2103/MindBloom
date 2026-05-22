'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, MoodCheckin, Message, Challenge, Badge, Post } from '@/types';
import { MoodScoringEngine } from '@/services/mood-scoring-engine';
import { supabase, isMock } from '@/lib/supabase-client';

interface MindBloomContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  checkins: MoodCheckin[];
  addCheckin: (value: number, note: string, tags: string[], sleepHours: number, focusScore: number) => void;
  messages: Message[];
  addMessage: (role: 'user' | 'assistant', content: string, sentiment?: Message['sentiment']) => void;
  clearChat: () => void;
  challenges: Challenge[];
  toggleChallenge: (id: string) => void;
  badges: Badge[];
  earnBadge: (id: string) => void;
  posts: Post[];
  addPost: (content: string) => void;
  reactToPost: (postId: string, reactionType: 'hugs' | 'support' | 'calm') => void;
  user: any;
  isLoading: boolean;
}

const MindBloomContext = createContext<MindBloomContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getAuthToken() {
  if (isMock) return 'mock-token';
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || 'mock-token';
}

const initialProfile: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex@mindbloom.ai',
  role: 'none', // Set during onboarding
  gender: '',
  intentions: [],
  challenges: [],
  xp: 0,
  level: 1,
  streak: 0,
  notificationsEnabled: true,
  earnedBadges: [],
  completedChallenges: []
};

const initialChallenges: Challenge[] = [
  { id: 'c1', title: 'Daily Mood Log', description: 'Check in your emotional state to maintain awareness.', xpReward: 20, completed: false, category: 'daily' },
  { id: 'c2', title: 'Calm Breathing Guide', description: 'Complete a 3-minute paced breathing exercise.', xpReward: 30, completed: false, category: 'daily' },
  { id: 'c3', title: 'Connect with Companion', description: 'Chat with your AI Companion for positive reflection.', xpReward: 25, completed: false, category: 'daily' },
  { id: 'c5', title: 'Consistent Sleep Streak', description: 'Log sleep >= 7 hours for 3 check-ins.', xpReward: 50, completed: false, category: 'weekly' }
];

const initialBadges: Badge[] = [
  { id: 'b1', name: 'First Check-in', description: 'Logged your very first mood on MindBloom.', icon: 'spa', earned: false },
  { id: 'b2', name: 'Mindfulness Master', description: 'Completed 5 breathing or zen grounding exercises.', icon: 'self_improvement', earned: false },
  { id: 'b3', name: 'Stress Warrior', description: 'Achieved a relaxed stress rating of 2 or below.', icon: 'shield_moon', earned: false },
  { id: 'b5', name: '7-Day Streak', description: 'Logged in and checked in for 7 days in a row.', icon: 'local_fire_department', earned: false }
];

export function MindBloomProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [checkins, setCheckins] = useState<MoodCheckin[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm_init', role: 'assistant', content: "Hello! I'm your MindBloom wellness companion. How has your day been? Feel free to share whatever is on your mind, or let me know if you want to try a grounding exercise.", timestamp: new Date().toISOString() }
  ]);
  const [posts, setPosts] = useState<Post[]>([]);

  // Compute challenges and badges dynamically from profile
  const challenges: Challenge[] = initialChallenges.map(c => ({
    ...c,
    completed: profile.completedChallenges?.includes(c.id) || false
  }));

  const badges: Badge[] = initialBadges.map(b => {
    const earned = profile.earnedBadges?.includes(b.id) || false;
    return {
      ...b,
      earned,
      earnedDate: earned ? new Date().toISOString().split('T')[0] : undefined
    };
  });

  const syncWithBackend = async (authToken?: string) => {
    try {
      const token = authToken || await getAuthToken();
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 1. Fetch Profile
      const profRes = await fetch(`${API_BASE_URL}/api/profile`, { headers });
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
        localStorage.setItem('mb_profile', JSON.stringify(profData));
      }

      // 2. Fetch Mood Checkins
      const moodRes = await fetch(`${API_BASE_URL}/api/mood`, { headers });
      if (moodRes.ok) {
        const moodData = await moodRes.json();
        setCheckins(moodData);
        localStorage.setItem('mb_checkins', JSON.stringify(moodData));
      }

      // 3. Fetch Chat Messages
      const chatRes = await fetch(`${API_BASE_URL}/api/chat`, { headers });
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        if (chatData && chatData.length > 0) {
          setMessages(chatData);
          localStorage.setItem('mb_messages', JSON.stringify(chatData));
        }
      }

      // 4. Fetch Community Posts (no-op since removed, but keep stub to avoid breaking API)
      const postRes = await fetch(`${API_BASE_URL}/api/community`, { headers });
      if (postRes.ok) {
        const postData = await postRes.json();
        setPosts(postData);
        localStorage.setItem('mb_posts', JSON.stringify(postData));
      }
    } catch (err) {
      console.warn('Could not sync state with backend, keeping local state:', err);
    }
  };

  // Sync state from localStorage and listen to auth changes on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('mb_profile');
      const savedCheckins = localStorage.getItem('mb_checkins');
      const savedMessages = localStorage.getItem('mb_messages');
      const savedPosts = localStorage.getItem('mb_posts');

      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedCheckins) setCheckins(JSON.parse(savedCheckins));
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      if (savedPosts) setPosts(JSON.parse(savedPosts));
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      setUser(session?.user || null);
      setIsLoading(false);
      if (session?.access_token) {
        await syncWithBackend(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setProfile(initialProfile);
        setCheckins([]);
        setMessages([
          { id: 'm_init', role: 'assistant', content: "Hello! I'm your MindBloom wellness companion. How has your day been? Feel free to share whatever is on your mind, or let me know if you want to try a grounding exercise.", timestamp: new Date().toISOString() }
        ]);
        setPosts([]);
        localStorage.clear();
      }
    });

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.access_token) {
        await syncWithBackend(session.access_token);
      }
      setIsLoading(false);
    };

    if (isMock) {
      syncWithBackend('mock-token');
      setIsLoading(false);
    } else {
      initSession();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update profile handler
  const updateProfile = async (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('mb_profile', JSON.stringify(updated));
      return updated;
    });

    try {
      const token = await getAuthToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const savedProfile = await res.json();
        setProfile(prev => {
          const updated = {
            ...prev,
            role: savedProfile.role || prev.role,
            age: savedProfile.age || prev.age,
            maritalStatus: savedProfile.maritalStatus || prev.maritalStatus,
            gender: savedProfile.gender || prev.gender,
            smoking: savedProfile.smoking || prev.smoking,
            alcohol: savedProfile.alcohol || prev.alcohol,
            xp: savedProfile.xp || prev.xp,
            level: savedProfile.level || prev.level,
            streak: savedProfile.streak || prev.streak
          };
          localStorage.setItem('mb_profile', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.warn('Backend profile update failed, using local changes:', err);
    }
  };

  // Add Mood Checkin handler
  const addCheckin = async (value: number, note: string, tags: string[], sleepHours: number, focusScore: number) => {
    const stressVal = MoodScoringEngine.calculateStressLevel(value, sleepHours, focusScore);
    const tempCheckin: MoodCheckin = {
      id: Date.now().toString(),
      value,
      note,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      tags,
      sleepHours,
      focusScore,
      stressLevel: stressVal
    };

    setCheckins(prev => {
      const updated = [tempCheckin, ...prev];
      localStorage.setItem('mb_checkins', JSON.stringify(updated));
      return updated;
    });

    // Award XP for mood checking
    let xpGain = 20;
    const completedChallenges = [...(profile.completedChallenges || [])];
    if (!completedChallenges.includes('c1')) {
      completedChallenges.push('c1');
      const moodLogChallenge = initialChallenges.find(c => c.id === 'c1');
      if (moodLogChallenge) {
        xpGain += moodLogChallenge.xpReward;
      }
    }

    const earnedBadges = [...(profile.earnedBadges || [])];
    if (stressVal <= 2 && !earnedBadges.includes('b3')) {
      earnedBadges.push('b3');
    }
    if (!earnedBadges.includes('b1')) {
      earnedBadges.push('b1');
    }

    const nextXp = profile.xp + xpGain;
    const nextLevel = Math.floor(nextXp / 200) + 1;

    updateProfile({
      completedChallenges,
      earnedBadges,
      xp: nextXp,
      level: nextLevel,
      streak: profile.streak + 1
    });

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/mood`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value,
          note,
          date: tempCheckin.date,
          tags,
          sleepHours,
          focusScore
        })
      });

      if (response.ok) {
        const savedLog = await response.json();
        const verifiedLog: MoodCheckin = {
          id: savedLog.id || tempCheckin.id,
          value: savedLog.value !== undefined ? savedLog.value : tempCheckin.value,
          note: savedLog.note || tempCheckin.note,
          date: savedLog.date || tempCheckin.date,
          timestamp: savedLog.timestamp || tempCheckin.timestamp,
          tags: savedLog.tags || tempCheckin.tags,
          sleepHours: savedLog.sleepHours !== undefined ? savedLog.sleepHours : tempCheckin.sleepHours,
          focusScore: savedLog.focusScore !== undefined ? savedLog.focusScore : tempCheckin.focusScore,
          stressLevel: savedLog.stressLevel !== undefined ? savedLog.stressLevel : tempCheckin.stressLevel
        };

        setCheckins(prev => {
          const filtered = prev.filter(c => c.id !== tempCheckin.id);
          const updated = [verifiedLog, ...filtered];
          localStorage.setItem('mb_checkins', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.warn('Backend mood checkin submission failed, using local checkin:', err);
    }
  };

  // Chat message handlers
  const addMessage = async (role: 'user' | 'assistant', content: string, sentiment?: Message['sentiment']) => {
    if (role === 'assistant') {
      const newMsg: Message = {
        id: Date.now().toString(),
        role,
        content,
        timestamp: new Date().toISOString(),
        sentiment
      };

      setMessages(prev => {
        const updated = [...prev, newMsg];
        localStorage.setItem('mb_messages', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const tempUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => {
      const updated = [...prev, tempUserMsg];
      localStorage.setItem('mb_messages', JSON.stringify(updated));
      return updated;
    });

    const chatChallenge = initialChallenges.find(c => c.id === 'c3');
    const completedChallenges = [...(profile.completedChallenges || [])];
    if (chatChallenge && !completedChallenges.includes('c3')) {
      completedChallenges.push('c3');
      const nextXp = profile.xp + chatChallenge.xpReward;
      const nextLevel = Math.floor(nextXp / 200) + 1;
      updateProfile({
        completedChallenges,
        xp: nextXp,
        level: nextLevel
      });
    }

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const data = await response.json();
        
        const userMsg: Message = {
          id: data.user.id || tempUserMsg.id,
          role: 'user',
          content: data.user.content || content,
          timestamp: data.user.timestamp || tempUserMsg.timestamp
        };

        const assistantMsg: Message = {
          id: data.assistant.id || Date.now().toString(),
          role: 'assistant',
          content: data.assistant.content,
          timestamp: data.assistant.timestamp || new Date().toISOString(),
          sentiment: data.assistant.sentiment
        };

        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMsg.id);
          const updated = [...filtered, userMsg, assistantMsg];
          localStorage.setItem('mb_messages', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.warn('Backend chat response generation failed, falling back to mock reply:', err);
      setTimeout(() => {
        const mockReply: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I hear you, and I'm here to support you. Let me know if you would like to try one of our relief exercises.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, mockReply]);
      }, 1000);
    }
  };

  const clearChat = async () => {
    const initial = [
      { id: 'm_init', role: 'assistant', content: "Hello! I'm your MindBloom wellness companion. How has your day been? Feel free to share whatever is on your mind, or let me know if you want to try a grounding exercise.", timestamp: new Date().toISOString() }
    ] as Message[];
    setMessages(initial);
    localStorage.setItem('mb_messages', JSON.stringify(initial));

    try {
      const token = await getAuthToken();
      await fetch(`${API_BASE_URL}/api/chat/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.warn('Backend chat clear request failed:', err);
    }
  };

  // Toggle/Complete generic challenge
  const toggleChallenge = (id: string) => {
    const currentCompleted = profile.completedChallenges || [];
    const isCompleted = currentCompleted.includes(id);
    let nextCompleted: string[];
    let xpDiff = 0;
    const challenge = initialChallenges.find(c => c.id === id);
    const xpReward = challenge ? challenge.xpReward : 0;

    if (isCompleted) {
      nextCompleted = currentCompleted.filter(cid => cid !== id);
      xpDiff = -xpReward;
    } else {
      nextCompleted = [...currentCompleted, id];
      xpDiff = xpReward;
    }

    const nextXp = Math.max(0, profile.xp + xpDiff);
    const nextLevel = Math.floor(nextXp / 200) + 1;

    updateProfile({
      completedChallenges: nextCompleted,
      xp: nextXp,
      level: nextLevel
    });
  };

  // Badge earner
  const earnBadge = (id: string) => {
    const currentBadges = profile.earnedBadges || [];
    if (currentBadges.includes(id)) return;
    const nextBadges = [...currentBadges, id];
    updateProfile({
      earnedBadges: nextBadges
    });
  };

  // Forum post handlers
  const addPost = async (content: string) => {
    const tempPost: Post = {
      id: Date.now().toString(),
      author: profile.name,
      role: profile.role === 'student' ? 'Student' : profile.role === 'professional' ? 'Professional' : 'Wellness Member',
      content,
      timestamp: 'Just now',
      reactions: { hugs: 0, support: 0, calm: 0 },
      comments: []
    };

    setPosts(prev => {
      const updated = [tempPost, ...prev];
      localStorage.setItem('mb_posts', JSON.stringify(updated));
      return updated;
    });

    const commChallenge = challenges.find(c => c.id === 'c4');
    if (commChallenge && !commChallenge.completed) {
      const nextCompleted = [...(profile.completedChallenges || []), 'c4'];
      const nextXp = profile.xp + commChallenge.xpReward;
      updateProfile({
        completedChallenges: nextCompleted,
        xp: nextXp,
        level: Math.floor(nextXp / 200) + 1
      });
    }

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/community`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const postRes = await fetch(`${API_BASE_URL}/api/community`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (postRes.ok) {
          const postData = await postRes.json();
          setPosts(postData);
          localStorage.setItem('mb_posts', JSON.stringify(postData));
        }
      }
    } catch (err) {
      console.warn('Backend community post creation failed, using local item:', err);
    }
  };

  const reactToPost = async (postId: string, reactionType: 'hugs' | 'support' | 'calm') => {
    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === postId) {
          const nextReactions = { ...p.reactions };
          let nextUserReaction = reactionType;

          if (p.userReaction === reactionType) {
            nextReactions[reactionType] = Math.max(0, nextReactions[reactionType] - 1);
            nextUserReaction = null as any;
          } else {
            if (p.userReaction) {
              nextReactions[p.userReaction] = Math.max(0, nextReactions[p.userReaction] - 1);
            }
            nextReactions[reactionType] += 1;
          }

          return {
            ...p,
            reactions: nextReactions,
            userReaction: nextUserReaction
          };
        }
        return p;
      });
      localStorage.setItem('mb_posts', JSON.stringify(updated));
      return updated;
    });

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/community/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId, reactionType })
      });
      
      if (response.ok) {
        const postRes = await fetch(`${API_BASE_URL}/api/community`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (postRes.ok) {
          const postData = await postRes.json();
          setPosts(postData);
          localStorage.setItem('mb_posts', JSON.stringify(postData));
        }
      }
    } catch (err) {
      console.warn('Backend reactToPost failed, using local reaction:', err);
    }
  };

  return (
    <MindBloomContext.Provider
      value={{
        profile,
        updateProfile,
        checkins,
        addCheckin,
        messages,
        addMessage,
        clearChat,
        challenges,
        toggleChallenge,
        badges,
        earnBadge,
        posts,
        addPost,
        reactToPost,
        user,
        isLoading
      }}
    >
      {children}
    </MindBloomContext.Provider>
  );
}

export function useMindBloom() {
  const context = useContext(MindBloomContext);
  if (!context) {
    throw new Error('useMindBloom must be used within a MindBloomProvider');
  }
  return context;
}
export { MindBloomContext };
