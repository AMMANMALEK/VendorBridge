import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import swaggerSpec from './swagger';

import { authRoutes } from './modules/auth';
import { userRoutes } from './modules/users';
import { dashboardRoutes } from './modules/dashboard';
import { vendorRoutes } from './modules/vendors';
import { rfqRoutes } from './modules/rfqs';
import { quotationRoutes } from './modules/quotations';
import { approvalRoutes } from './modules/approvals';
import { purchaseOrderRoutes } from './modules/purchase-orders';
import { invoiceRoutes } from './modules/invoices';
import { notificationRoutes } from './modules/notifications';
import { activityRoutes } from './modules/activity-logs';
import { reportRoutes } from './modules/reports';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.get('/', (_req, res) => {
  res.json({ message: 'VendorBridge ERP API', version: '1.0.0', docs: '/api-docs' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/rfqs', rfqRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/approvals', approvalRoutes);
app.use('/api/v1/purchase-orders', purchaseOrderRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/reports', reportRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`VendorBridge ERP running on http://localhost:${config.port}`);
  console.log(`Swagger docs at http://localhost:${config.port}/api-docs`);
});

export default app;
