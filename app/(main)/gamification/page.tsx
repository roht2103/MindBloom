'use client';

import React, { useState } from 'react';
import { useMindBloom } from '@/components/ui/mindbloom-provider';

export default function GamificationPage() {
  const { profile, updateProfile, badges, earnBadge, challenges, toggleChallenge } = useMindBloom();
  const [redeemedReward, setRedeemedReward] = useState<string | null>(null);

  // Compute XP progress
  const xpPerLevel = 200;
  const currentLevelXp = profile.xp % xpPerLevel;
  const xpPercentage = Math.round((currentLevelXp / xpPerLevel) * 100);
  const xpRemaining = xpPerLevel - currentLevelXp;

  // Simulate claiming a reward
  const handleClaimReward = (rewardName: string, xpCost: number) => {
    if (profile.xp < xpCost) {
      alert("You need more XP to claim this reward! Complete daily challenges and log your mood to earn XP.");
      return;
    }

    updateProfile({
      xp: profile.xp - xpCost,
      level: Math.floor((profile.xp - xpCost) / 200) + 1
    });

    setRedeemedReward(rewardName);
    setTimeout(() => setRedeemedReward(null), 4000);
  };

  // Helper to click badge to test/simulate earning
  const handleTestEarnBadge = (badgeId: string, badgeName: string) => {
    earnBadge(badgeId);
    alert(`Badge "${badgeName}" unlocked! Check your profile stats.`);
  };

  const rewards = [
    { id: 'r1', name: 'Custom Mascot Skin (Forest Green)', cost: 100, icon: 'palette', description: 'Unlock a special forest design theme for Bloom.' },
    { id: 'r2', name: '15-Minute Audio Soundscape (Tibetan Forest)', cost: 150, icon: 'library_music', description: 'Unlock a high-fidelity ambient track in the sound library.' },
    { id: 'r3', name: 'Certified MindBloom Participant Badge', cost: 250, icon: 'verified', description: 'Unlock a profile checkmark to display in discussions.' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <section>
        <h1 className="text-2xl font-display font-extrabold text-on-surface">Gamification Center</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          Monitor your wellness achievements, earn badges, build streak milestones, and redeem XP for platform rewards.
        </p>
      </section>

      {/* Level & XP Gauge */}
      <section className="bg-gradient-to-br from-primary-container/20 to-primary/10 border border-primary-container/20 rounded-[4px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 bg-primary text-on-primary flex items-center justify-center font-display font-black text-2xl shadow-md"
              style={{ borderRadius: '4px' }}
            >
              Lvl {profile.level}
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-on-surface">Alex's Wellness Level</h2>
              <p className="text-xs text-on-surface-variant mt-0.5 font-medium">
                {profile.xp} total XP accumulated • {xpRemaining} XP until Level {profile.level + 1}
              </p>
            </div>
          </div>
          
          <div className="w-full md:w-64 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-on-surface-variant">
              <span>Progress</span>
              <span>{xpPercentage}%</span>
            </div>
            <div className="h-3 bg-surface-container-high rounded-sm overflow-hidden border border-outline-variant/15">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Streak Dashboard and Challenges Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Badges showcase */}
        <section className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-6 shadow-sm">
          <h3 className="text-base font-display font-bold text-on-surface mb-4">Earned Badges</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map(badge => (
              <div 
                key={badge.id}
                onClick={() => !badge.earned && handleTestEarnBadge(badge.id, badge.name)}
                className={`p-4 border rounded-[4px] flex items-start gap-3.5 transition-all select-none ${
                  badge.earned 
                    ? 'bg-surface border-primary/20 shadow-sm cursor-default' 
                    : 'bg-surface-container-low/40 border-outline-variant/15 opacity-60 hover:opacity-80 hover:border-outline cursor-pointer'
                }`}
              >
                <div 
                  className={`w-12 h-12 flex items-center justify-center text-xl border rounded-[4px] shrink-0 ${
                    badge.earned 
                      ? 'bg-primary/10 border-primary/20 text-primary' 
                      : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {badge.earned ? badge.icon : 'lock'}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-on-surface truncate flex items-center gap-1">
                    {badge.name}
                    {!badge.earned && <span className="text-[9px] text-primary font-bold">(Test Unlock)</span>}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-on-surface-variant font-medium mt-0.5">
                    {badge.description}
                  </p>
                  {badge.earned && badge.earnedDate && (
                    <span className="text-[9px] text-secondary font-bold block mt-1.5">
                      Unlocked on {badge.earnedDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Quest Checklist & Redeemable shop */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Streak tracker visualizer */}
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-display font-bold text-on-surface">Streak Tracker</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Maintain consecutive mood logs</p>
              </div>
              <span className="material-symbols-outlined text-orange-500 fill-current animate-pulse text-[24px]">
                local_fire_department
              </span>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 select-none">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-10 h-12 rounded-[4px] border flex flex-col items-center justify-center transition-all ${
                    i < profile.streak 
                      ? 'bg-orange-500/10 border-orange-500/35 text-orange-600' 
                      : 'bg-surface border-outline-variant/15 text-on-surface-variant'
                  }`}
                >
                  <span className="text-[10px] font-bold">Day {i + 1}</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">
                    {i < profile.streak ? 'check_circle' : 'circle'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] font-semibold text-center text-on-surface-variant mt-4">
              Current active streak: <span className="font-extrabold text-orange-500">{profile.streak} Days</span>. Log daily to boost XP multipliers.
            </p>
          </section>

          {/* XP Rewards shop */}
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-display font-bold text-on-surface">XP Rewards Shop</h3>
            
            {redeemedReward && (
              <div className="p-3 bg-secondary/15 border border-secondary/20 text-secondary text-xs font-bold rounded-[4px] text-center animate-bounce">
                Claimed: {redeemedReward}! Reward unlocked.
              </div>
            )}

            <div className="space-y-3.5">
              {rewards.map(reward => {
                const canAfford = profile.xp >= reward.cost;
                return (
                  <div 
                    key={reward.id} 
                    className="border border-outline-variant/15 p-3 rounded-[4px] flex items-center justify-between gap-3 bg-surface/30"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-on-surface truncate flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[16px]">{reward.icon}</span>
                        {reward.name}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleClaimReward(reward.name, reward.cost)}
                      className={`px-3 py-1.5 rounded-[4px] text-[10px] font-bold cursor-pointer shrink-0 transition-colors ${
                        canAfford 
                          ? 'bg-secondary text-on-secondary hover:bg-secondary/95 shadow-sm' 
                          : 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/10'
                      }`}
                    >
                      {reward.cost} XP
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
