import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getValidAdminUserId } from '@/lib/auth';
import { ensureCategoryExistsInDb, validateBrandId } from '@/lib/categories';
import prisma from '@/lib/db';

describe('Foreign Key Constraint Resilience Layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getValidAdminUserId', () => {
    it('returns null if no userId is provided', async () => {
      const result = await getValidAdminUserId(undefined);
      expect(result).toBeNull();
    });

    it('resolves the DB owner when passed non-uuid master-owner-root', async () => {
      const mockOwner = { id: 'c876eb5e-f222-4b97-9d30-a89bb578851d', role: 'OWNER' };
      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockOwner as any);

      const result = await getValidAdminUserId('master-owner-root');
      expect(result).toBe(mockOwner.id);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { role: 'OWNER' },
        select: { id: true },
      });
    });

    it('returns null safely if master-owner-root is passed but no owner exists in DB', async () => {
      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      const result = await getValidAdminUserId('master-owner-root');
      expect(result).toBeNull();
    });

    it('returns existing userId if the UUID exists in the database', async () => {
      const validUuid = '11111111-2222-3333-4444-555555555555';
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: validUuid } as any);

      const result = await getValidAdminUserId(validUuid);
      expect(result).toBe(validUuid);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: validUuid },
        select: { id: true },
      });
    });

    it('falls back to owner if a valid UUID does not exist in the database', async () => {
      const nonExistentUuid = '99999999-9999-9999-9999-999999999999';
      const mockOwner = { id: 'c876eb5e-f222-4b97-9d30-a89bb578851d', role: 'OWNER' };
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockOwner as any);

      const result = await getValidAdminUserId(nonExistentUuid);
      expect(result).toBe(mockOwner.id);
    });
  });

  describe('validateBrandId', () => {
    it('returns null if brandId is undefined, null, or empty string', async () => {
      expect(await validateBrandId(undefined)).toBeNull();
      expect(await validateBrandId(null)).toBeNull();
      expect(await validateBrandId('')).toBeNull();
      expect(await validateBrandId('   ')).toBeNull();
    });

    it('returns brandId if brand exists in database', async () => {
      const brandId = 'brand-uuid-123';
      vi.spyOn(prisma.brand, 'findUnique').mockResolvedValue({ id: brandId } as any);

      const result = await validateBrandId(brandId);
      expect(result).toBe(brandId);
    });

    it('returns null if brandId does not exist in database', async () => {
      vi.spyOn(prisma.brand, 'findUnique').mockResolvedValue(null);

      const result = await validateBrandId('non-existent-brand');
      expect(result).toBeNull();
    });
  });

  describe('ensureCategoryExistsInDb', () => {
    it('returns categoryId if category exists in database', async () => {
      const catId = 'cat-uuid-123';
      vi.spyOn(prisma.category, 'findUnique').mockResolvedValue({ id: catId } as any);

      const result = await ensureCategoryExistsInDb(catId);
      expect(result).toBe(catId);
    });

    it('falls back to existing active category if categoryId does not exist', async () => {
      const fallbackCat = { id: 'fallback-cat-uuid', name: 'General' };
      vi.spyOn(prisma.category, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.category, 'findFirst').mockResolvedValue(fallbackCat as any);

      const result = await ensureCategoryExistsInDb('missing-category-id');
      expect(result).toBe(fallbackCat.id);
    });
  });
});
