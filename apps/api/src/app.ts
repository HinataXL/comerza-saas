import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import routes from './routes';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import productsRoutes from './routes/products.routes';
import customersRoutes from './routes/customers.routes';
import salesRoutes from './routes/sales.routes';
import tenantRoutes from './routes/tenant.routes';
import qpayproRoutes from './routes/qpaypro.routes';
import superadminRoutes from './routes/superadmin.routes';
import webhooksRoutes from './routes/webhooks.routes';
import reportsRoutes from './routes/reports.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));

// Servir archivos estáticos (logos, etc)
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/qpaypro', qpayproRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/upload', uploadRoutes);

export default app;
