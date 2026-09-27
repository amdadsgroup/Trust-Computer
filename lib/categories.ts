import prisma from '@/lib/db';
import { DEFAULT_CATEGORIES, StoreCategoryItem } from './categories-data';

export * from './categories-data';

/**
 * Returns active categories for admin forms and listings.
 * Prioritizes the 7 official store categories in proper sortOrder,
 * and guarantees never returning an empty list.
 */
export async function getAdminCategories(): Promise<Array<{ id: string; name: string; slug?: string }>> {
  try {
    const dbCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, sortOrder: true },
    });

    if (dbCategories && dbCategories.length > 0) {
      // Check if all 7 default categories are in the result; if any are missing or inactive, merge them in
      const existingSlugs = new Set(dbCategories.map((c) => c.slug));
      const missingDefaults = DEFAULT_CATEGORIES.filter((d) => !existingSlugs.has(d.slug));

      if (missingDefaults.length === 0) {
        return dbCategories;
      }

      return [
        ...dbCategories,
        ...missingDefaults.map((d) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          sortOrder: d.sortOrder,
        })),
      ].sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
    }
  } catch (error) {
    console.error('Error querying categories from DB, using defaults fallback:', error);
  }

  // Resilient fallback: All 7 official default categories
  return DEFAULT_CATEGORIES.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
  }));
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
  } catch (error) {
    console.error('ensureCategoryExistsInDb warning:', error);
  }

  // Fallback: Pick any existing active category or create default
  try {
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
  } catch {
    return categoryId;
  }
}

/**
 * Validates brandId against the database.
 * If the brand does not exist or DB fails, returns null to avoid foreign key errors.
 */
export async function validateBrandId(brandId?: string | null): Promise<string | null> {
  if (!brandId) return null;
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { id: true },
    });
    return brand ? brand.id : null;
  } catch {
    return null;
  }
}

