'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMindBloom } from '@/components/ui/mindbloom-provider';
import { supabase, isMock } from '@/lib/supabase-client';

export default function OnboardingIntentionsPage() {
  const router = useRouter();
  const { profile, updateProfile } = useMindBloom();
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>(
    profile.intentions || ['chat']
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleIntention = (id: string) => {
    setSelectedIntentions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (selectedIntentions.length === 0) return;
    setSaving(true);
    setError('');

    // Prepare complete profile data to match what backend app.py expects
    const completeProfileData = {
      name: profile.name,
      email: profile.email,
      role: profile.role,
      age: profile.age,
      maritalStatus: profile.maritalStatus,
      gender: profile.gender,
      smoking: profile.smoking,
      alcohol: profile.alcohol,
      intentions: selectedIntentions,
      challenges: profile.challenges || [],
      xp: profile.xp || 120,
      level: profile.level || 1,
      streak: profile.streak || 3,
      notificationsEnabled: profile.notificationsEnabled ?? true
    };

    // Get Auth token if available
    let token = 'mock-token';
    if (!isMock) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          token = session.access_token;
        }
      } catch (err) {
        console.error('Error fetching session token:', err);
      }
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(completeProfileData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save profile to backend.');
      }

      const updatedProfile = await response.json();
      
      // Update local context profile state with returned values (mapping snake_case keys if needed)
      // The Flask backend profile route handles the mapping and returns camelCase frontend fields
      updateProfile({
        intentions: selectedIntentions,
        role: updatedProfile.role || profile.role,
        age: updatedProfile.age || profile.age,
        maritalStatus: updatedProfile.maritalStatus || profile.maritalStatus,
        gender: updatedProfile.gender || profile.gender,
        smoking: updatedProfile.smoking || profile.smoking,
        alcohol: updatedProfile.alcohol || profile.alcohol,
        xp: updatedProfile.xp || profile.xp,
        level: updatedProfile.level || profile.level,
        streak: updatedProfile.streak || profile.streak
      });

      setSaving(false);
      router.push('/dashboard');
    } catch (err: any) {
      console.warn('Backend profile saving failed, falling back to local memory storage:', err);
      // Fallback: save locally in context and proceed
      updateProfile({ 
        intentions: selectedIntentions 
      });
      setSaving(false);
      router.push('/dashboard');
    }
  };

  const options = [
    {
      id: 'chat',
      title: 'AI Companion Support',
      desc: 'A safe, non-judgmental space to talk through your feelings anytime.',
      icon: 'chat_bubble',
      bgColor: 'bg-primary/10 text-primary',
    },
    {
      id: 'exercises',
      title: 'Guided Breathing & Games',
      desc: 'Interactive exercises and breathing tools to ground you in the moment.',
      icon: 'spa',
      bgColor: 'bg-secondary/10 text-secondary',
    },
    {
      id: 'sounds',
      title: 'Music & Soundscapes',
      desc: 'Curated frequencies and background hums designed to calm your nerves.',
      icon: 'music_note',
      bgColor: 'bg-tertiary/10 text-tertiary',
    },
    {
      id: 'journaling',
      title: 'Emotional Journaling',
      desc: 'Reflective prompts to help you track your mood and process thoughts.',
      icon: 'edit_note',
      bgColor: 'bg-surface-variant text-on-surface-variant',
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Header Section */}
      <div className="text-center mb-8 space-y-3">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Almost there, {profile.name}!
        </h2>
        <p className="font-sans text-sm text-on-surface-variant max-w-xl mx-auto">
          How would you like to start your wellness journey today? Select all that apply.
        </p>
      </div>

      {error && (
        <div className="w-full max-w-4xl p-3 bg-error-container text-on-error-container text-xs mb-6 border border-error/25 font-sans" style={{ borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Options Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-8">
        {options.map((option) => {
          const isSelected = selectedIntentions.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => toggleIntention(option.id)}
              className={`glass-card flex items-start gap-4 p-5 text-left border transition-all duration-300 ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-outline-variant/35 hover:shadow-[0_15px_30px_0_rgba(103,75,181,0.05)]'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center shrink-0 ${option.bgColor}`}
                style={{ borderRadius: '4px' }}
              >
                <span
                  className="material-symbols-outlined text-xl select-none"
                  style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {option.icon}
                </span>
              </div>
              <div>
                <h3 className="font-display text-xs font-bold text-foreground mb-1">{option.title}</h3>
                <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
                  {option.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Decorative Visual Card */}
      <div className="relative w-full max-w-4xl h-36 mb-8 overflow-hidden select-none" style={{ borderRadius: '4px' }}>
        <img
          alt="Serene Sunrise"
          className="w-full h-full object-cover opacity-80"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqv0OaTABxi8TZHi7N8KoDDxDpd6C0eEift4dtDY7SX1CwyBTr46_Lv0lM72Kw8pApcO3-olbxzlHtGG2PSXLRy1u15cemh0Pa75wk2DP_MS2fV2_Uba3tgrXssUscXEWbg07MA1OGXYDfk37Co0R5WF1m7G7FLk0gllpbGhy1pBpiFEepUO82nxnd-ygT13LHsviCEA1OnF_0ehd_p31eVTEemDP7xZzamLHHzp5PuICxgDJhA_cUPbkYmDbHWcU9iTvkhVS5Jg"
          style={{ borderRadius: '4px' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent"></div>
      </div>

      {/* Final Action CTA */}
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        <button
          onClick={handleFinish}
          disabled={selectedIntentions.length === 0 || saving}
          className={`w-full py-4 text-on-primary bg-primary font-sans text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            selectedIntentions.length === 0 || saving ? 'opacity-40 cursor-not-allowed' : 'hover:bg-primary-hover shadow-md'
          }`}
          style={{ borderRadius: '4px' }}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
              Setting up your sanctuary...
            </>
          ) : (
            <>
              Start My Journey
              <span className="material-symbols-outlined text-sm select-none">arrow_forward</span>
            </>
          )}
        </button>
        <p className="font-sans text-xs text-on-surface-variant/80 text-center">
          You can modify these intentions at any time in your Settings.
        </p>

        <div className="flex gap-4 w-full mt-2">
          <button
            onClick={() => router.push('/onboarding/personal')}
            className="flex-1 py-3 border border-primary/20 hover:bg-primary/5 text-primary font-sans text-sm font-semibold transition-all cursor-pointer"
            style={{ borderRadius: '4px' }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
