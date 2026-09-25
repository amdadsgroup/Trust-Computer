'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  updateHomepageSectionAction,
  reorderHomepageSectionsAction,
} from './actions';
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit2,
  Check,
  X,
  ExternalLink,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface SectionItem {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string | null;
  sortOrder: number;
  isVisible: boolean;
}

export default function HomepageControlClient({
  initialSections,
}: {
  initialSections: SectionItem[];
}) {
  const [sections, setSections] = useState<SectionItem[]>(initialSections);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingSubtitle, setEditingSubtitle] = useState('');

  const handleToggleVisible = async (sectionKey: string, current: boolean) => {
    const nextState = !current;
    setSections((prev) =>
      prev.map((s) => (s.sectionKey === sectionKey ? { ...s, isVisible: nextState } : s))
    );
    await updateHomepageSectionAction(sectionKey, { isVisible: nextState });
  };

  const handleMove = async (index: number, direction: 'UP' | 'DOWN') => {
    const newSections = [...sections];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    setSections(newSections);
    await reorderHomepageSectionsAction(newSections.map((s) => s.sectionKey));
  };

  const startEdit = (s: SectionItem) => {
    setEditingKey(s.sectionKey);
    setEditingTitle(s.title);
    setEditingSubtitle(s.subtitle || '');
  };

  const saveEdit = async (sectionKey: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.sectionKey === sectionKey
          ? { ...s, title: editingTitle, subtitle: editingSubtitle }
          : s
      )
    );
    setEditingKey(null);
    await updateHomepageSectionAction(sectionKey, {
      title: editingTitle,
      subtitle: editingSubtitle,
    });
  };

  const getSectionHelperLink = (key: string) => {
    switch (key) {
      case 'HERO_BANNER':
        return { label: 'Manage Hero Banners', href: '/admin/banners' };
      case 'FEATURED_OFFERS':
        return { label: 'Manage Promotional Offers', href: '/admin/offers' };
      case 'FEATURED_CATEGORIES':
        return { label: 'Manage Categories', href: '/admin/categories' };
      case 'FEATURED_PRODUCTS':
      case 'NEW_ARRIVALS':
        return { label: 'Manage Products', href: '/admin/products' };
      case 'SHOWROOM_INFO':
        return { label: 'Edit Store Details', href: '/admin/settings' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Info Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Homepage Section Ordering & Visibility
          </span>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Use the arrows to reorder sections. Use the toggle buttons to show or hide sections instantly on the public storefront.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 bg-[#081621] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md flex-shrink-0 self-start sm:self-auto"
        >
          <span>View Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          const isFirst = index === 0;
          const isLast = index === sections.length - 1;
          const isEditing = editingKey === section.sectionKey;
          const helperLink = getSectionHelperLink(section.sectionKey);

          return (
            <div
              key={section.sectionKey}
              className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                section.isVisible
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-50 border-slate-200/60 opacity-60'
              }`}
            >
              {/* Order Controls & Details */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Up/Down buttons */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleMove(index, 'UP')}
                    disabled={isFirst}
                    title="Move Section Up"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'DOWN')}
                    disabled={isLast}
                    title="Move Section Down"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0084d6] flex items-center justify-center font-black text-xs flex-shrink-0">
                  {index + 1}
                </div>

                {isEditing ? (
                  <div className="space-y-2 flex-1 max-w-lg">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full text-xs sm:text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-[#0084d6] focus:bg-white"
                      placeholder="Section Title"
                    />
                    <input
                      type="text"
                      value={editingSubtitle}
                      onChange={(e) => setEditingSubtitle(e.target.value)}
                      className="w-full text-xs text-slate-500 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-[#0084d6] focus:bg-white"
                      placeholder="Optional Subtitle"
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => saveEdit(section.sectionKey)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                        {section.title}
                      </h3>
                      <button
                        onClick={() => startEdit(section)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Edit Section Title"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    {section.subtitle && (
                      <p className="text-xs text-slate-500 truncate">{section.subtitle}</p>
                    )}
                    <span className="text-[10px] font-mono text-slate-400 block">
                      KEY: {section.sectionKey}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions & Links */}
              <div className="flex items-center gap-3 justify-end flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {helperLink && (
                  <Link
                    href={helperLink.href}
                    className="text-xs font-bold text-[#0084d6] hover:underline flex items-center gap-1"
                  >
                    <span>{helperLink.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}

                <button
                  onClick={() => handleToggleVisible(section.sectionKey, section.isVisible)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                    section.isVisible
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {section.isVisible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
