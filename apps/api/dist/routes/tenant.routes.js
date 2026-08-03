"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenant_controller_1 = require("../controllers/tenant.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/integrations', tenant_controller_1.getTenantIntegrations);
router.put('/integrations', tenant_controller_1.updateTenantIntegrations);
router.get('/settings', tenant_controller_1.getTenantSettings);
router.patch('/settings', tenant_controller_1.updateTenantSettings);
router.post('/upload-logo', upload.single('logo'), tenant_controller_1.uploadLogo);
exports.default = router;
