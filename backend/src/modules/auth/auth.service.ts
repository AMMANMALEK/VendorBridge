import prisma from '../../config/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateToken } from '../../utils/generateToken';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    company?: string;
    phone?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw { statusCode: 400, message: 'Email already registered' };
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'procurement_officer',
        company: data.company,
        phone: data.phone
      },
      select: { id: true, name: true, email: true, role: true }
    });
    const token = generateToken(user.id);
    return { token, user };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { statusCode: 401, message: 'Invalid email or password' };
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw { statusCode: 401, message: 'Invalid email or password' };
    if (!user.isActive) throw { statusCode: 403, message: 'Account deactivated' };
    const token = generateToken(user.id);
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { statusCode: 404, message: 'User not found' };
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: new Date(Date.now() + 3600000)
      }
    });
    return { message: 'Password reset link sent to email', resetToken };
  }

  async resetPassword(token: string, password: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { gt: new Date() }
      }
    });
    if (!user) throw { statusCode: 400, message: 'Invalid or expired reset token' };
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null
      }
    });
    return { message: 'Password reset successful' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, company: true, phone: true, isActive: true, createdAt: true }
    });
    if (!user) throw { statusCode: 404, message: 'User not found' };
    return user;
  }
}
