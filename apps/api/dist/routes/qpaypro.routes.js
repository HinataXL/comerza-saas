"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qpaypro_controller_1 = require("../controllers/qpaypro.controller");
const router = (0, express_1.Router)();
// Endpoint público que recibirá la redirección de QPayPro
router.get('/relay/:saleId', qpaypro_controller_1.handleRelay);
router.post('/relay/:saleId', qpaypro_controller_1.handleRelay);
exports.default = router;
