import prisma from './config/prisma';
import bcrypt from 'bcryptjs';

const seed = async () => {
  console.log('Seeding database...');

  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@vendorbridge.com' } });
  if (!adminExists) {
    const salt = await bcrypt.genSalt(12);
    const password = await bcrypt.hash('password123', salt);
    await prisma.user.create({
      data: { name: 'Admin User', email: 'admin@vendorbridge.com', password, role: 'admin' }
    });
    console.log('Admin user created: admin@vendorbridge.com / password123');
  }

  const officerExists = await prisma.user.findUnique({ where: { email: 'officer@vendorbridge.com' } });
  if (!officerExists) {
    const salt = await bcrypt.genSalt(12);
    const password = await bcrypt.hash('password123', salt);
    await prisma.user.create({
      data: { name: 'Procurement Officer', email: 'officer@vendorbridge.com', password, role: 'procurement_officer' }
    });
    console.log('Officer user created: officer@vendorbridge.com / password123');
  }

  const managerExists = await prisma.user.findUnique({ where: { email: 'manager@vendorbridge.com' } });
  if (!managerExists) {
    const salt = await bcrypt.genSalt(12);
    const password = await bcrypt.hash('password123', salt);
    await prisma.user.create({
      data: { name: 'Manager User', email: 'manager@vendorbridge.com', password, role: 'manager' }
    });
    console.log('Manager user created: manager@vendorbridge.com / password123');
  }

  const vendorUserExists = await prisma.user.findUnique({ where: { email: 'vendor@vendorbridge.com' } });
  if (!vendorUserExists) {
    const salt = await bcrypt.genSalt(12);
    const password = await bcrypt.hash('password123', salt);
    const vendorUser = await prisma.user.create({
      data: { name: 'Vendor User', email: 'vendor@vendorbridge.com', password, role: 'vendor' }
    });
    console.log('Vendor user created: vendor@vendorbridge.com / password123');

    const vendorExists = await prisma.vendor.findFirst({ where: { email: 'vendor@vendorbridge.com' } });
    if (!vendorExists) {
      await prisma.vendor.create({
        data: {
          companyName: 'Tech Supplies Inc.',
          contactPerson: 'Vendor User',
          email: 'vendor@vendorbridge.com',
          phone: '1234567890',
          address: '123 Vendor St, Tech City',
          category: 'technology',
          gstNumber: 'GST123456',
          userId: vendorUser.id
        }
      });
      console.log('Sample vendor created: Tech Supplies Inc.');
    }
  }

  const extraVendors = [
    { companyName: 'Global Logistics Co.', contactPerson: 'John Smith', email: 'john@globallogistics.com', phone: '9876543210', address: '456 Logistics Ave', category: 'logistics', gstNumber: 'GST789012' },
    { companyName: 'Raw Materials Ltd.', contactPerson: 'Jane Doe', email: 'jane@rawmaterials.com', phone: '5551234567', address: '789 Industrial Park', category: 'raw_materials', gstNumber: 'GST345678' },
    { companyName: 'Consulting Group', contactPerson: 'Bob Wilson', email: 'bob@consulting.com', phone: '4445556666', address: '321 Business Blvd', category: 'consulting', gstNumber: 'GST901234' }
  ];

  for (const v of extraVendors) {
    const exists = await prisma.vendor.findFirst({ where: { email: v.email } });
    if (!exists) {
      await prisma.vendor.create({ data: v });
      console.log(`Vendor created: ${v.companyName}`);
    }
  }

  console.log('Seed completed!');
  await prisma.$disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
