'use client';

import React, { useState } from 'react';
import { useMindBloom } from '@/components/ui/mindbloom-provider';

export default function ProfilePage() {
  const { profile, updateProfile, checkins, badges } = useMindBloom();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editGender, setEditGender] = useState(profile.gender || '');
  const [successMsg, setSuccessMsg] = useState(false);

  // Compute stats
  const totalLogs = checkins.length;
  const earnedBadges = badges.filter(b => b.earned);
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      gender: editGender
    });
    setIsEditing(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <section>
        <h1 className="text-2xl font-display font-extrabold text-on-surface">Your Wellness Profile</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          Review your wellness achievements, statistics milestones, and personalize your details.
        </p>
      </section>

      {/* Profile Overview Card + Inline Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Avatar card and details */}
        <section className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="w-full space-y-4">
            {/* Avatar Circle */}
            <div 
              className="w-20 h-20 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-3xl mx-auto shadow-inner"
              style={{ borderRadius: '50%' }}
            >
              👤
            </div>
            
            {!isEditing ? (
              <div className="space-y-1">
                <h2 className="text-base font-display font-bold text-on-surface flex items-center justify-center gap-1.5">
                  {profile.name}
                </h2>
                <p className="text-xs text-on-surface-variant font-medium">{profile.email}</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1.5">
                  Level {profile.level} • {profile.xp} XP
                </p>
                {profile.role !== 'none' && (
                  <span className="inline-block bg-secondary/15 text-secondary border border-secondary/20 px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-2">
                    {profile.role === 'student' ? 'Student Member' : 'Professional Member'}
                  </span>
                )}
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-3 text-left">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary font-medium mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Gender Identity</label>
                  <input
                    type="text"
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    placeholder="e.g. Non-binary, Male, Female"
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary font-medium mt-1"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-primary text-on-primary hover:bg-primary/95 text-xs font-bold py-1.5 px-4 rounded-lg cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 border border-primary/20 text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer w-full"
            >
              Edit Profile Details
            </button>
          )}

          {successMsg && (
            <p className="text-xs font-bold text-secondary mt-3 animate-pulse">
              ✓ Details updated.
            </p>
          )}
        </section>

        {/* Right column: Highlights and Badges Grid */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Wellness Highlights stats grid */}
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-display font-bold text-on-surface mb-4">Wellness Highlights</h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="border border-outline-variant/15 p-3 rounded-lg bg-surface/30">
                <span className="text-2xl font-display font-extrabold text-primary">{totalLogs}</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mt-1">Logs Entries</span>
              </div>
              <div className="border border-outline-variant/15 p-3 rounded-lg bg-surface/30">
                <span className="text-2xl font-display font-extrabold text-orange-500">{profile.streak}</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mt-1">Daily Streak</span>
              </div>
              <div className="border border-outline-variant/15 p-3 rounded-lg bg-surface/30">
                <span className="text-2xl font-display font-extrabold text-secondary">{earnedBadges.length}</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mt-1">Earned Badges</span>
              </div>
            </div>
          </section>

          {/* Onboarding Selections */}
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Health Intentions</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.intentions.length === 0 ? (
                  <span className="text-xs text-on-surface-variant font-medium">None configured.</span>
                ) : (
                  profile.intentions.map(int => (
                    <span 
                      key={int} 
                      className="px-2.5 py-1 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/10 capitalize"
                    >
                      {int.replace('-', ' ')}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Primary Challenges</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.challenges.length === 0 ? (
                  <span className="text-xs text-on-surface-variant font-medium">None configured.</span>
                ) : (
                  profile.challenges.map(chal => (
                    <span 
                      key={chal} 
                      className="px-2.5 py-1 bg-tertiary/5 text-tertiary text-xs font-bold rounded-lg border border-tertiary/10 capitalize"
                    >
                      {chal.replace('-', ' ')}
                    </span>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Earned badges grid */}
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-display font-bold text-on-surface mb-3.5">Unlocked Showcases</h3>
            {earnedBadges.length === 0 ? (
              <p className="text-xs text-on-surface-variant font-medium py-3 text-center">
                Earn badges by achieving stress-free logs or daily quest challenges.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {earnedBadges.map(badge => (
                  <div 
                    key={badge.id}
                    className="border border-primary/15 bg-primary/5 p-3 rounded-lg flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-primary bg-background p-1.5 border border-primary/10 rounded-lg text-[20px] select-none">
                      {badge.icon}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-on-surface truncate">{badge.name}</h4>
                      <span className="text-[9px] text-secondary font-bold">Earned</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
