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
  xp: 120,
  level: 1,
  streak: 3,
  notificationsEnabled: true
};

const initialCheckins: MoodCheckin[] = [
  { id: '1', value: 7, note: 'Had a productive morning study session.', date: '2026-05-16', timestamp: '2026-05-16T09:00:00Z', tags: ['Productive', 'Calm'], sleepHours: 7.5, focusScore: 8, stressLevel: 3 },
  { id: '2', value: 6, note: 'Felt a bit overwhelmed by the afternoon meetings.', date: '2026-05-17', timestamp: '2026-05-17T17:00:00Z', tags: ['Tired', 'Overwhelmed'], sleepHours: 6, focusScore: 6, stressLevel: 5 },
  { id: '3', value: 8, note: 'Great run in the evening. Sleep was amazing.', date: '2026-05-18', timestamp: '2026-05-18T08:30:00Z', tags: ['Energetic', 'Grateful'], sleepHours: 8.5, focusScore: 9, stressLevel: 2 },
  { id: '4', value: 5, note: 'Struggling to focus on coding projects today.', date: '2026-05-19', timestamp: '2026-05-19T14:15:00Z', tags: ['Anxious', 'Distracted'], sleepHours: 5, focusScore: 5, stressLevel: 6 },
  { id: '5', value: 7, note: 'Meditation helped stabilize my focus.', date: '2026-05-20', timestamp: '2026-05-20T10:00:00Z', tags: ['Focused', 'Peaceful'], sleepHours: 7, focusScore: 8, stressLevel: 3 },
  { id: '6', value: 6, note: 'Decent day, but feeling the end-of-week burnout.', date: '2026-05-21', timestamp: '2026-05-21T18:30:00Z', tags: ['Tired'], sleepHours: 6.5, focusScore: 7, stressLevel: 4 },
];

const initialChallenges: Challenge[] = [
  { id: 'c1', title: 'Daily Mood Log', description: 'Check in your emotional state to maintain awareness.', xpReward: 20, completed: false, category: 'daily' },
  { id: 'c2', title: 'Calm Breathing Guide', description: 'Complete a 3-minute paced breathing exercise.', xpReward: 30, completed: false, category: 'daily' },
  { id: 'c3', title: 'Connect with Companion', description: 'Chat with your AI Companion for positive reflection.', xpReward: 25, completed: false, category: 'daily' },
  { id: 'c4', title: 'Share Encouragement', description: 'Post an uplifting comment or thought on the Community board.', xpReward: 40, completed: false, category: 'weekly' },
  { id: 'c5', title: 'Consistent Sleep Streak', description: 'Log sleep >= 7 hours for 3 check-ins.', xpReward: 50, completed: false, category: 'weekly' }
];

const initialBadges: Badge[] = [
  { id: 'b1', name: 'First Check-in', description: 'Logged your very first mood on MindBloom.', icon: 'spa', earned: true, earnedDate: '2026-05-16' },
  { id: 'b2', name: 'Mindfulness Master', description: 'Completed 5 breathing or zen grounding exercises.', icon: 'self_improvement', earned: false },
  { id: 'b3', name: 'Stress Warrior', description: 'Achieved a relaxed stress rating of 2 or below.', icon: 'shield_moon', earned: true, earnedDate: '2026-05-18' },
  { id: 'b4', name: 'Community Beacon', description: 'Contributed 3 support notes to fellow users.', icon: 'forum', earned: false },
  { id: 'b5', name: '7-Day Streak', description: 'Logged in and checked in for 7 days in a row.', icon: 'local_fire_department', earned: false }
];

const initialPosts: Post[] = [
  {
    id: 'p1',
    author: 'Elena Vance',
    role: 'Student',
    content: "Finals week is finally over! Sending calm vibes to anyone who is still testing. Remember to breathe and step away from the desk. You've got this!",
    timestamp: '3 hours ago',
    reactions: { hugs: 12, support: 8, calm: 15 },
    comments: [
      { id: 'c1_1', author: 'Markus D.', content: 'Thank you for this! Needed to hear it today.', timestamp: '2 hours ago' }
    ]
  },
  {
    id: 'p2',
    author: 'Ryan Howard',
    role: 'Professional',
    content: 'Just started using the paced breathing bubble here. It is surprising how much just 3 minutes of focused breathing can lower my heart rate after a tough client call.',
    timestamp: 'Yesterday',
    reactions: { hugs: 5, support: 14, calm: 9 },
    comments: []
  }
];

export function MindBloomProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [checkins, setCheckins] = useState<MoodCheckin[]>(initialCheckins);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm_init', role: 'assistant', content: "Hello! I'm your MindBloom wellness companion. How has your day been? Feel free to share whatever is on your mind, or let me know if you want to try a grounding exercise.", timestamp: new Date().toISOString() }
  ]);
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

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

      // 4. Fetch Community Posts
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
      const savedChallenges = localStorage.getItem('mb_challenges');
      const savedBadges = localStorage.getItem('mb_badges');
      const savedPosts = localStorage.getItem('mb_posts');

      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedCheckins) setCheckins(JSON.parse(savedCheckins));
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      if (savedChallenges) setChallenges(JSON.parse(savedChallenges));
      if (savedBadges) setBadges(JSON.parse(savedBadges));
      if (savedPosts) setPosts(JSON.parse(savedPosts));
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.access_token) {
        await syncWithBackend(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setProfile(initialProfile);
        setCheckins(initialCheckins);
        setMessages([
          { id: 'm_init', role: 'assistant', content: "Hello! I'm your MindBloom wellness companion. How has your day been? Feel free to share whatever is on your mind, or let me know if you want to try a grounding exercise.", timestamp: new Date().toISOString() }
        ]);
        setChallenges(initialChallenges);
        setBadges(initialBadges);
        setPosts(initialPosts);
        localStorage.clear();
      }
    });

    if (isMock) {
      syncWithBackend('mock-token');
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
    const moodLogChallenge = challenges.find(c => c.id === 'c1');
    if (moodLogChallenge && !moodLogChallenge.completed) {
      setChallenges(prevC => {
        const updatedC = prevC.map(c => c.id === 'c1' ? { ...c, completed: true } : c);
        localStorage.setItem('mb_challenges', JSON.stringify(updatedC));
        return updatedC;
      });
      xpGain += moodLogChallenge.xpReward;
    }

    if (stressVal <= 2) {
      earnBadge('b3');
    }

    updateProfile({
      xp: profile.xp + xpGain,
      level: Math.floor((profile.xp + xpGain) / 200) + 1,
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

    const chatChallenge = challenges.find(c => c.id === 'c3');
    if (chatChallenge && !chatChallenge.completed) {
      setChallenges(prevC => {
        const updatedC = prevC.map(c => c.id === 'c3' ? { ...c, completed: true } : c);
        localStorage.setItem('mb_challenges', JSON.stringify(updatedC));
        return updatedC;
      });
      updateProfile({
        xp: profile.xp + chatChallenge.xpReward,
        level: Math.floor((profile.xp + chatChallenge.xpReward) / 200) + 1
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
    setChallenges(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          const nextCompleted = !c.completed;
          if (nextCompleted) {
            updateProfile({
              xp: profile.xp + c.xpReward,
              level: Math.floor((profile.xp + c.xpReward) / 200) + 1
            });
          } else {
            updateProfile({
              xp: Math.max(0, profile.xp - c.xpReward),
              level: Math.floor(Math.max(0, profile.xp - c.xpReward) / 200) + 1
            });
          }
          return { ...c, completed: nextCompleted };
        }
        return c;
      });
      localStorage.setItem('mb_challenges', JSON.stringify(updated));
      return updated;
    });
  };

  // Badge earner
  const earnBadge = (id: string) => {
    setBadges(prev => {
      const updated = prev.map(b => {
        if (b.id === id && !b.earned) {
          return { ...b, earned: true, earnedDate: new Date().toISOString().split('T')[0] };
        }
        return b;
      });
      localStorage.setItem('mb_badges', JSON.stringify(updated));
      return updated;
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
      setChallenges(prevC => {
        const updatedC = prevC.map(c => c.id === 'c4' ? { ...c, completed: true } : c);
        localStorage.setItem('mb_challenges', JSON.stringify(updatedC));
        return updatedC;
      });
      updateProfile({
        xp: profile.xp + commChallenge.xpReward,
        level: Math.floor((profile.xp + commChallenge.xpReward) / 200) + 1
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
        reactToPost
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
