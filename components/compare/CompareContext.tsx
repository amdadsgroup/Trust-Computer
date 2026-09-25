'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  sellingPrice: number;
  compareAtPrice?: number | null;
  stock: number;
  images?: Array<{ url: string; altText?: string | null }>;
  category?: { name: string; slug: string } | null;
  brand?: { name: string } | null;
  warrantyInfo?: string | null;
  specifications?: Array<{ group: string; key: string; value: string }>;
}

interface CompareContextType {
  compareItems: CompareProduct[];
  addToCompare: (product: CompareProduct) => boolean; // returns false if already at limit
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  compareCount: number;
  maxCompare: number;
}

const MAX_COMPARE_ITEMS = 4;

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareProduct[]>([]);

  const addToCompare = useCallback((product: CompareProduct): boolean => {
    setCompareItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev; // Already added
      if (prev.length >= MAX_COMPARE_ITEMS) return prev; // Limit reached
      return [...prev, product];
    });

    // Return false if limit would be exceeded or already present
    return !(compareItems.length >= MAX_COMPARE_ITEMS || compareItems.some((p) => p.id === product.id));
  }, [compareItems]);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInCompare = useCallback(
    (productId: string) => compareItems.some((p) => p.id === productId),
    [compareItems]
  );

  const clearCompare = useCallback(() => setCompareItems([]), []);

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        compareCount: compareItems.length,
        maxCompare: MAX_COMPARE_ITEMS,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextType {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
