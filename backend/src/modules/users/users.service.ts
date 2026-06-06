import prisma from '../../config/prisma';

export class UsersService {
  async getUsers() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, company: true, phone: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateUser(id: string, data: { name?: string; role?: string; isActive?: boolean }) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    return user;
  }
}
