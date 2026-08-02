import { Router } from 'express';
import { getTenantIntegrations, updateTenantIntegrations, getTenantSettings, updateTenantSettings, uploadLogo } from '../controllers/tenant.controller';
import { authenticate } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.use(authenticate);
router.get('/integrations', getTenantIntegrations);
router.put('/integrations', updateTenantIntegrations);
router.get('/settings', getTenantSettings);
router.patch('/settings', updateTenantSettings);
router.post('/upload-logo', upload.single('logo'), uploadLogo);

export default router;
