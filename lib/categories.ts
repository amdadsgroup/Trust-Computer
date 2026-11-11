import prisma from '@/lib/db';
import { DEFAULT_CATEGORIES, StoreCategoryItem } from './categories-data';
import { edgeCache } from '@/lib/cache-edge';
import { getCatalogFilterMetadata } from '@/lib/db/catalog';
import { createAdminClient } from '@/lib/supabase/admin';

export * from './categories-data';

function mergeWithDefaultCategories(
  dbCategories: Array<{ id: string; name: string; slug: string | null; sortOrder?: number | null }>
): Array<{ id: string; name: string; slug?: string }> {
  const existingSlugs = new Set(dbCategories.map((c) => c.slug));
  const missingDefaults = DEFAULT_CATEGORIES.filter((d) => !existingSlugs.has(d.slug));

  if (missingDefaults.length === 0) {
    return dbCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug || undefined,
    }));
  }

  return [
    ...dbCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug || undefined,
      sortOrder: c.sortOrder ?? 99,
    })),
    ...missingDefaults.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      sortOrder: d.sortOrder,
    })),
  ]
    .sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99))
    .map(({ id, name, slug }) => ({ id, name, slug }));
}

export const getCachedCategoryCounts = edgeCache(
  async () => {
    try {
      const meta = await getCatalogFilterMetadata();
      const counts: Record<string, number> = {};
      if (meta && meta.categories) {
        meta.categories.forEach((c) => {
          counts[c.slug] = c._count?.products ?? 0;
        });
      }
      return {
        total: meta?.totalInStore ?? 11,
        counts,
      };
    } catch (error) {
      console.error('getCachedCategoryCounts error:', error);
      return {
        total: 11,
        counts: {
          'laptop-computer': 5,
          monitor: 3,
          gaming: 0,
          'computer-accessories': 0,
          'cctv-security': 3,
          networking: 0,
          'power-electronics': 0,
        },
      };
    }
  },
  ['api-category-counts-v2'],
  { revalidate: 300, tags: ['category-counts', 'categories', 'products'] }
);
/**
 * Returns active categories for admin forms and listings.
 * Prioritizes the 7 official store categories in proper sortOrder,
 * and guarantees never returning an empty list.
 */
export const getAdminCategories = edgeCache(
  async (): Promise<Array<{ id: string; name: string; slug?: string }>> => {
    try {
      const dbCategories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, slug: true, sortOrder: true },
      });

      if (dbCategories && dbCategories.length > 0) {
        return mergeWithDefaultCategories(dbCategories);
      }
    } catch (error) {
      // Fall through to Supabase REST
    }

    const sb = createAdminClient();
    if (sb) {
      try {
        const { data } = await sb
          .from('categories')
          .select('id, name, slug, sortOrder')
          .eq('isActive', true)
          .order('sortOrder', { ascending: true })
          .order('name', { ascending: true });

        if (data && data.length > 0) {
          return mergeWithDefaultCategories(data);
        }
      } catch (sbErr) {
        console.error('Supabase REST categories fallback failed:', sbErr);
      }
    }

    // Resilient fallback: All 7 official default categories
    return DEFAULT_CATEGORIES.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
    }));
  },
  ['admin-categories-v1'],
  { revalidate: 300, tags: ['categories'] }
);

async function upsertDefaultCategoryViaSupabase(
  sb: NonNullable<ReturnType<typeof createAdminClient>>,
  item: StoreCategoryItem
): Promise<string | null> {
  const { data: existingBySlug } = await sb
    .from('categories')
    .select('id')
    .eq('slug', item.slug)
    .maybeSingle();
  if (existingBySlug) return existingBySlug.id;

  const now = new Date().toISOString();
  const { data: created } = await sb
    .from('categories')
    .insert({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description || null,
      sortOrder: item.sortOrder,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .select('id')
    .single();
  return created?.id || null;
}

/**
 * Ensures that the given category exists in the database.
 * If not present, it will automatically upsert the matching default category
 * to prevent foreign-key violation during product creation.
 */
export async function ensureCategoryExistsInDb(categoryId: string): Promise<string> {
  try {
    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (existing) {
      return existing.id;
    }

    // Check if it matches one of our known defaults
    const matched = DEFAULT_CATEGORIES.find((d) => d.id === categoryId);
    if (matched) {
      const created = await prisma.category.upsert({
        where: { slug: matched.slug },
        update: {
          id: matched.id,
          name: matched.name,
          description: matched.description,
          sortOrder: matched.sortOrder,
          isActive: true,
        },
        create: {
          id: matched.id,
          name: matched.name,
          slug: matched.slug,
          description: matched.description,
          sortOrder: matched.sortOrder,
          isActive: true,
        },
      });
      return created.id;
    }

    // Fallback: Pick any existing active category or create default
    const anyCat = await prisma.category.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (anyCat) return anyCat.id;

    const fallback = DEFAULT_CATEGORIES[0];
    const created = await prisma.category.upsert({
      where: { slug: fallback.slug },
      update: { isActive: true },
      create: {
        id: fallback.id,
        name: fallback.name,
        slug: fallback.slug,
        description: fallback.description,
        sortOrder: fallback.sortOrder,
        isActive: true,
      },
    });
    return created.id;
  } catch (error) {
    const sb = createAdminClient();
    if (sb) {
      try {
        const { data: existing } = await sb
          .from('categories')
          .select('id')
          .eq('id', categoryId)
          .maybeSingle();
        if (existing) return existing.id;

        const matched = DEFAULT_CATEGORIES.find((d) => d.id === categoryId);
        if (matched) {
          const id = await upsertDefaultCategoryViaSupabase(sb, matched);
          if (id) return id;
        }

        const { data: anyCat } = await sb
          .from('categories')
          .select('id')
          .eq('isActive', true)
          .limit(1)
          .maybeSingle();
        if (anyCat) return anyCat.id;

        const fallbackId = await upsertDefaultCategoryViaSupabase(sb, DEFAULT_CATEGORIES[0]);
        if (fallbackId) return fallbackId;
      } catch (sbErr) {
        console.error('ensureCategoryExistsInDb Supabase fallback warning:', sbErr);
      }
    }
    return categoryId;
  }
}

/**
 * Validates brandId against the database.
 * If the brand does not exist or DB fails, returns null to avoid foreign key errors.
 */
export async function validateBrandId(brandId?: string | null): Promise<string | null> {
  const cleanId = brandId?.trim();
  if (!cleanId) return null;
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: cleanId },
      select: { id: true },
    });
    return brand ? brand.id : null;
  } catch {
    try {
      const sb = createAdminClient();
      if (!sb) return null;
      const { data: brand } = await sb
        .from('brands')
        .select('id')
        .eq('id', cleanId)
        .maybeSingle();
      return brand ? brand.id : null;
    } catch {
      return null;
    }
  }
}

