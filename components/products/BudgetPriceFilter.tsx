'use client';

import React, { useState, useEffect, useId } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Wallet, Check, RotateCcw, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface BudgetPreset {
  id: string;
  labelEn: string;
  labelBn: string;
  min: string;
  max: string;
}

export const BUDGET_PRESETS: BudgetPreset[] = [
  { id: 'under-5k', labelEn: 'Under ৳5K', labelBn: '৳৫হাজারের নিচে', min: '', max: '5000' },
  { id: '5k-15k', labelEn: '৳5K - ৳15K', labelBn: '৳৫হাজার - ৳১৫হাজার', min: '5000', max: '15000' },
  { id: '15k-35k', labelEn: '৳15K - ৳35K', labelBn: '৳১৫হাজার - ৳৩৫হাজার', min: '15000', max: '35000' },
  { id: '35k-60k', labelEn: '৳35K - ৳60K', labelBn: '৳৩৫হাজার - ৳৬০হাজার', min: '35000', max: '60000' },
  { id: 'above-60k', labelEn: 'Above ৳60K', labelBn: '৳৬০হাজারের উপরে', min: '60000', max: '' },
];

const MAX_LIMIT = 150000;
const STEP = 1000;

interface BudgetPriceFilterProps {
  currentMinPrice?: string;
  currentMaxPrice?: string;
  /** If true, operates in controlled mode without updating router directly */
  isEmbedded?: boolean;
  value?: { min: string; max: string };
  onChange?: (val: { min: string; max: string }) => void;
  className?: string;
}

export default function BudgetPriceFilter({
  currentMinPrice = '',
  currentMaxPrice = '',
  isEmbedded = false,
  value,
  onChange,
  className = '',
}: BudgetPriceFilterProps) {
  const { isBangla } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine active min/max strings
  const effectiveMin = isEmbedded ? value?.min ?? '' : currentMinPrice;
  const effectiveMax = isEmbedded ? value?.max ?? '' : currentMaxPrice;

  // Input states
  const [minInput, setMinInput] = useState<string>(effectiveMin);
  const [maxInput, setMaxInput] = useState<string>(effectiveMax);

  // Slider numerical values
  const [minVal, setMinVal] = useState<number>(
    effectiveMin && !isNaN(Number(effectiveMin)) ? Number(effectiveMin) : 0
  );
  const [maxVal, setMaxVal] = useState<number>(
    effectiveMax && !isNaN(Number(effectiveMax)) ? Number(effectiveMax) : MAX_LIMIT
  );

  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  // Keep internal state in sync when URL or parent value changes
  useEffect(() => {
    setMinInput(effectiveMin);
    setMaxInput(effectiveMax);

    const parsedMin = effectiveMin && !isNaN(Number(effectiveMin)) ? Number(effectiveMin) : 0;
    const parsedMax = effectiveMax && !isNaN(Number(effectiveMax)) ? Number(effectiveMax) : MAX_LIMIT;

    setMinVal(Math.max(0, Math.min(parsedMin, MAX_LIMIT)));
    setMaxVal(Math.max(0, Math.min(parsedMax, MAX_LIMIT)));
  }, [effectiveMin, effectiveMax]);

  const hasActiveBudget = Boolean(effectiveMin || effectiveMax);

  // Check if a preset is active
  const activePresetId = BUDGET_PRESETS.find(
    (p) => (p.min || '') === effectiveMin && (p.max || '') === effectiveMax
  )?.id;

  // Apply handler
  const handleApply = (newMin?: string, newMax?: string) => {
    const minToApply = newMin !== undefined ? newMin : minInput.trim();
    const maxToApply = newMax !== undefined ? newMax : maxInput.trim();

    // Sanitize values
    let finalMin = minToApply && !isNaN(Number(minToApply)) && Number(minToApply) > 0 ? String(Number(minToApply)) : '';
    let finalMax = maxToApply && !isNaN(Number(maxToApply)) && Number(maxToApply) > 0 ? String(Number(maxToApply)) : '';

    // If both specified and min > max, swap them
    if (finalMin && finalMax && Number(finalMin) > Number(finalMax)) {
      const temp = finalMin;
      finalMin = finalMax;
      finalMax = temp;
    }

    if (isEmbedded && onChange) {
      onChange({ min: finalMin, max: finalMax });
    } else {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
      if (finalMin) {
        params.set('minPrice', finalMin);
      } else {
        params.delete('minPrice');
      }

      if (finalMax) {
        params.set('maxPrice', finalMax);
      } else {
        params.delete('maxPrice');
      }

      params.delete('page');
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    }
  };

  // Reset handler
  const handleReset = () => {
    setMinInput('');
    setMaxInput('');
    setMinVal(0);
    setMaxVal(MAX_LIMIT);

    if (isEmbedded && onChange) {
      onChange({ min: '', max: '' });
    } else {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
      params.delete('minPrice');
      params.delete('maxPrice');
      params.delete('page');
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    }
  };

  // Preset click handler
  const handlePresetClick = (preset: BudgetPreset) => {
    if (activePresetId === preset.id) {
      // Toggle off
      handleReset();
    } else {
      setMinInput(preset.min);
      setMaxInput(preset.max);
      setMinVal(preset.min ? Number(preset.min) : 0);
      setMaxVal(preset.max ? Number(preset.max) : MAX_LIMIT);
      handleApply(preset.min, preset.max);
    }
  };

  // Slider changes
  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxVal - STEP);
    setMinVal(value);
    const textVal = value > 0 ? String(value) : '';
    setMinInput(textVal);
    if (isEmbedded && onChange) {
      onChange({ min: textVal, max: maxInput });
    }
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minVal + STEP);
    setMaxVal(value);
    const textVal = value < MAX_LIMIT ? String(value) : '';
    setMaxInput(textVal);
    if (isEmbedded && onChange) {
      onChange({ min: minInput, max: textVal });
    }
  };

  const minPercent = Math.min(100, Math.max(0, (minVal / MAX_LIMIT) * 100));
  const maxPercent = Math.min(100, Math.max(0, (maxVal / MAX_LIMIT) * 100));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Title & Clear Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-brand" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {isBangla ? 'বাজেট ফিল্টার' : 'Budget / Price'}
          </h3>
        </div>
        {hasActiveBudget && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-accent-600 hover:text-accent-800 font-semibold flex items-center gap-0.5 transition"
            title={isBangla ? 'বাজেট রিসেট করুন' : 'Reset Budget'}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isBangla ? 'রিসেট' : 'Reset'}</span>
          </button>
        )}
      </div>

      {/* Active Range Preview Badge (if set) */}
      {hasActiveBudget && (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-100 rounded-xl px-2.5 py-1.5 text-xs text-brand-900 font-semibold">
          <span className="truncate">
            {effectiveMin && effectiveMax
              ? `৳${Number(effectiveMin).toLocaleString('en-BD')} - ৳${Number(effectiveMax).toLocaleString('en-BD')}`
              : effectiveMin
              ? `Above ৳${Number(effectiveMin).toLocaleString('en-BD')}`
              : `Up to ৳${Number(effectiveMax).toLocaleString('en-BD')}`}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-brand-600 hover:text-accent p-0.5 rounded-md hover:bg-brand-100 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Budget Presets */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
          <span>{isBangla ? 'জনপ্রিয় বাজেট' : 'Quick Presets'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {BUDGET_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                  isSelected
                    ? 'bg-brand text-white border-brand shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50/50'
                }`}
              >
                {isBangla ? preset.labelBn : preset.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Interactive Range Slider */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>৳{minVal.toLocaleString('en-BD')}</span>
          <span>
            ৳{maxVal.toLocaleString('en-BD')}
            {maxVal >= MAX_LIMIT ? '+' : ''}
          </span>
        </div>

        <div className="relative w-full h-5 flex items-center select-none">
          {/* Base Inactive Track */}
          <div className="absolute w-full h-1.5 bg-slate-200 rounded-full" />

          {/* Active Highlight Range Track */}
          <div
            className="absolute h-1.5 bg-brand rounded-full transition-all duration-75"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />

          {/* Min Thumb Slider */}
          <input
            type="range"
            min={0}
            max={MAX_LIMIT}
            step={STEP}
            value={minVal}
            onChange={handleMinSliderChange}
            onMouseDown={() => setActiveThumb('min')}
            onTouchStart={() => setActiveThumb('min')}
            className={`pointer-events-none absolute w-full h-1.5 appearance-none bg-transparent focus:outline-none ${
              activeThumb === 'min' || minVal > MAX_LIMIT - 10000 ? 'z-30' : 'z-20'
            } [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-125 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer`}
          />

          {/* Max Thumb Slider */}
          <input
            type="range"
            min={0}
            max={MAX_LIMIT}
            step={STEP}
            value={maxVal}
            onChange={handleMaxSliderChange}
            onMouseDown={() => setActiveThumb('max')}
            onTouchStart={() => setActiveThumb('max')}
            className={`pointer-events-none absolute w-full h-1.5 appearance-none bg-transparent focus:outline-none ${
              activeThumb === 'max' ? 'z-30' : 'z-20'
            } [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-125 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer`}
          />
        </div>
      </div>

      {/* Numerical Min / Max Inputs */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {isBangla ? 'সর্বনিম্ন (৳)' : 'Min Price (৳)'}
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-slate-400 font-bold text-xs select-none">৳</span>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={minInput}
              onChange={(e) => {
                const val = e.target.value;
                setMinInput(val);
                const n = Number(val);
                if (!isNaN(n)) setMinVal(Math.max(0, Math.min(n, MAX_LIMIT)));
                if (isEmbedded && onChange) onChange({ min: val, max: maxInput });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApply();
              }}
              className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {isBangla ? 'সর্বোচ্চ (৳)' : 'Max Price (৳)'}
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-slate-400 font-bold text-xs select-none">৳</span>
            <input
              type="number"
              min={0}
              placeholder={MAX_LIMIT.toLocaleString('en-US')}
              value={maxInput}
              onChange={(e) => {
                const val = e.target.value;
                setMaxInput(val);
                const n = Number(val);
                if (!isNaN(n)) setMaxVal(Math.max(0, Math.min(n, MAX_LIMIT)));
                if (isEmbedded && onChange) onChange({ min: minInput, max: val });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApply();
              }}
              className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition bg-white"
            />
          </div>
        </div>
      </div>

      {/* Standalone Apply Button (only when not embedded in mobile drawer) */}
      {!isEmbedded && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => handleApply()}
            className="w-full flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs active:scale-[0.98] transition cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isBangla ? 'বাজেট প্রয়োগ করুন' : 'Apply Budget Filter'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
