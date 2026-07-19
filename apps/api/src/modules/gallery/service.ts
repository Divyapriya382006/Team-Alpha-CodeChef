import { prisma } from '@/lib/prisma';
import { ForbiddenError, NotFoundError } from '@/lib/errors';
import type { AddGalleryItemInput } from './schemas';

export const galleryService = {
  async listGalleryItems({ clubId, page, limit }: { clubId?: string; page: number; limit: number }) {
    const where = clubId ? { clubId } : {};

    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        clubId: true,
        imageUrl: true,
        caption: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const total = await prisma.galleryItem.count({ where });
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  async addGalleryItem(clubId: string, callerId: string, isSuperAdmin: boolean, input: AddGalleryItemInput) {
    // 1. Verify club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true },
    });
    if (!club) {
      throw new NotFoundError('Club not found');
    }

    // 2. Authorization check
    if (!isSuperAdmin) {
      const membership = await prisma.clubMembership.findFirst({
        where: { clubId, userId: callerId, role: 'CLUB_HEAD' },
        select: { id: true },
      });
      if (!membership) {
        throw new ForbiddenError('Only the Club Head or Super Admin can add gallery items');
      }
    }

    // 3. Create item
    return prisma.galleryItem.create({
      data: {
        clubId,
        imageUrl: input.imageUrl,
        caption: input.caption,
        createdById: callerId,
      },
      select: {
        id: true,
        clubId: true,
        imageUrl: true,
        caption: true,
        createdAt: true,
      },
    });
  },

  async deleteGalleryItem(id: string, callerId: string, isSuperAdmin: boolean) {
    // 1. Find item
    const item = await prisma.galleryItem.findUnique({
      where: { id },
      select: { id: true, clubId: true },
    });
    if (!item) {
      throw new NotFoundError('Gallery item not found');
    }

    // 2. Authorization check
    if (!isSuperAdmin) {
      const membership = await prisma.clubMembership.findFirst({
        where: { clubId: item.clubId, userId: callerId, role: 'CLUB_HEAD' },
        select: { id: true },
      });
      if (!membership) {
        throw new ForbiddenError('Only the Club Head of this club or Super Admin can delete gallery items');
      }
    }

    // 3. Delete item
    await prisma.galleryItem.delete({
      where: { id },
    });
  },
};
