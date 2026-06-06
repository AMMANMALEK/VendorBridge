import prisma from '../../config/prisma';
import bcrypt from 'bcryptjs';

export class UsersService {
  async getUsers() {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, company: true, phone: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return users.map(user => ({
      ...user,
      status: user.isActive ? 'Active' : 'Inactive'
    }));
  }

  async updateUser(id: string, data: { name?: string; role?: string; isActive?: boolean; status?: string; password?: string }) {
    const payload: any = { ...data };
    if (typeof data.status === 'string') {
      payload.isActive = data.status.toLowerCase() !== 'inactive';
      delete payload.status;
    }
    if (typeof data.password === 'string' && data.password.length > 0) {
      const salt = await bcrypt.genSalt(12);
      payload.password = await bcrypt.hash(data.password, salt);
    } else {
      delete payload.password;
    }
    const user = await prisma.user.update({
      where: { id },
      data: payload,
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    return { ...user, status: user.isActive ? 'Active' : 'Inactive' };
  }
}
