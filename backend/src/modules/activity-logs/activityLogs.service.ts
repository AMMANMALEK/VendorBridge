import prisma from '../../config/prisma';

export class ActivityLogsService {
  async findAll(type?: string) {
    const where: any = {};
    if (type) where.type = type.toUpperCase();
    return prisma.activity.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }
}
