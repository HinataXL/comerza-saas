import { Router } from 'express';
import { getGlobalMetrics, getTenants, createTenant, toggleTenantStatus, impersonateTenant, changeTenantPlan, getPlans, updatePlan, getHealth, getAuditLogs, getGatewaysStatus, getAllUsers, createSuperadmin, deleteTenant, deleteUser } from '../controllers/superadmin.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/metrics', authenticate, getGlobalMetrics);
router.get('/tenants', authenticate, getTenants);
router.post('/tenants', authenticate, createTenant);
router.delete('/tenants/:id', authenticate, deleteTenant);
router.patch('/tenants/:id/status', authenticate, toggleTenantStatus);
router.patch('/tenants/:id/plan', authenticate, changeTenantPlan);
router.post('/tenants/:id/impersonate', authenticate, impersonateTenant);
router.get('/plans', authenticate, getPlans);
router.put('/plans/:name', authenticate, updatePlan);
router.get('/health', authenticate, getHealth);
router.get('/audit', authenticate, getAuditLogs);
router.get('/gateways/status', authenticate, getGatewaysStatus);
router.get('/users', authenticate, getAllUsers);
router.post('/users/superadmin', authenticate, createSuperadmin);
router.delete('/users/:id', authenticate, deleteUser);

export default router;
