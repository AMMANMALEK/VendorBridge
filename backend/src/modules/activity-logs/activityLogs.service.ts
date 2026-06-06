import prisma from '../../config/prisma';
import { Roles } from '../../constants';
import { UserPayload } from '../../types';

export class ActivityLogsService {
  async findAll(type?: string, user?: UserPayload) {
    const where: any = {};
    if (type) where.type = type.toUpperCase();
    if (user?.role === Roles.VENDOR) where.userId = user.id;
    return prisma.activity.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }
}
