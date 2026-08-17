"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("./subscription.controller");
const router = (0, express_1.Router)();
router.post('/recurrente/checkout', subscription_controller_1.createRecurrenteCheckout);
exports.default = router;
