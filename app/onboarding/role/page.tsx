'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMindBloom } from '@/components/ui/mindbloom-provider';

export default function OnboardingRolePage() {
  const router = useRouter();
  const { profile, updateProfile } = useMindBloom();
  const [selectedRole, setSelectedRole] = useState<'student' | 'professional' | null>(
    profile.role !== 'none' ? profile.role : null
  );
  const [age, setAge] = useState<number>(profile.age || 24);
  const [maritalStatus, setMaritalStatus] = useState<string>(profile.maritalStatus || 'Single');

  const handleContinue = () => {
    if (!selectedRole) return;
    updateProfile({ 
      role: selectedRole,
      age: age,
      maritalStatus: maritalStatus
    });
    router.push('/onboarding/personal');
  };

  const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'];

  return (
    <div className="flex flex-col items-center">
      {/* Onboarding Question */}
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
          Tell us about yourself
        </h2>
        <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto">
          Help us understand your context to tailor your mental wellness journey.
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        {/* Student Card */}
        <button
          onClick={() => setSelectedRole('student')}
          className={`group glass-card p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-300 ${
            selectedRole === 'student'
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'hover:shadow-[0_15px_30px_0_rgba(103,75,181,0.05)] border-outline-variant/35'
          }`}
          style={{ borderRadius: '4px' }}
        >
          <div
            className={`w-12 h-12 mb-4 flex items-center justify-center transition-transform group-hover:scale-105 ${
              selectedRole === 'student'
                ? 'bg-primary/20 text-primary'
                : 'bg-primary/10 text-primary'
            }`}
            style={{ borderRadius: '4px' }}
          >
            <span className="material-symbols-outlined text-[28px]">school</span>
          </div>
          <h3 className="font-display text-base font-bold mb-1 text-foreground">I'm a Student</h3>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            Focused on learning, exams, classes, and academic growth.
          </p>
        </button>

        {/* Professional Card */}
        <button
          onClick={() => setSelectedRole('professional')}
          className={`group glass-card p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-300 ${
            selectedRole === 'professional'
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'hover:shadow-[0_15px_30px_0_rgba(103,75,181,0.05)] border-outline-variant/35'
          }`}
          style={{ borderRadius: '4px' }}
        >
          <div
            className={`w-12 h-12 mb-4 flex items-center justify-center transition-transform group-hover:scale-105 ${
              selectedRole === 'professional'
                ? 'bg-tertiary/20 text-tertiary'
                : 'bg-tertiary/10 text-tertiary'
            }`}
            style={{ borderRadius: '4px' }}
          >
            <span className="material-symbols-outlined text-[28px]">work</span>
          </div>
          <h3 className="font-display text-base font-bold mb-1 text-foreground">I'm a Professional</h3>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            Managing career stress, workload, work-life balance, and focus.
          </p>
        </button>
      </div>

      {/* Demographics Block */}
      <div className="w-full max-w-2xl glass-card p-6 mb-8 border border-outline-variant/35 flex flex-col gap-6" style={{ borderRadius: '4px' }}>
        {/* Age Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              How old are you?
            </span>
            <span className="font-sans text-base font-bold text-primary">
              {age} years old
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-sans text-xs text-on-surface-variant">15</span>
            <input
              type="range"
              min="15"
              max="80"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="flex-1 accent-primary cursor-pointer h-1.5 bg-surface-container rounded-sm"
              style={{ borderRadius: '4px' }}
            />
            <span className="font-sans text-xs text-on-surface-variant">80</span>
          </div>
        </div>

        {/* Marital Status Chips */}
        <div className="flex flex-col gap-2.5">
          <span className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Marital Status
          </span>
          <div className="flex flex-wrap gap-2">
            {maritalOptions.map((status) => {
              const isSelected = maritalStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setMaritalStatus(status)}
                  className={`px-4 py-2 text-xs font-semibold font-sans transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high border-outline-variant/40'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`w-full py-4 text-on-primary bg-primary font-sans text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            !selectedRole ? 'opacity-40 cursor-not-allowed' : 'hover:bg-primary-hover shadow-md'
          }`}
          style={{ borderRadius: '4px' }}
        >
          Continue
        </button>
        <button
          onClick={() => {
            updateProfile({ role: 'none', age, maritalStatus });
            router.push('/onboarding/personal');
          }}
          className="text-on-surface-variant hover:text-primary font-sans text-xs font-semibold py-2 cursor-pointer transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
