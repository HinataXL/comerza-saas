"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservation_controller_1 = require("../controllers/reservation.controller");
const logs_controller_1 = require("../controllers/logs.controller");
const router = (0, express_1.Router)();
router.get('/reservations/action', reservation_controller_1.handleReservationAction);
router.post('/logs', logs_controller_1.createPublicLog);
exports.default = router;
