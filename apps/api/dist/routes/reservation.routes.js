"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservation_controller_1 = require("../controllers/reservation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Todas las rutas de reservaciones requieren autenticación
router.use(auth_middleware_1.authenticate);
router.get('/', reservation_controller_1.getReservations);
router.post('/', reservation_controller_1.createReservation);
router.put('/:id', reservation_controller_1.updateReservation);
router.delete('/:id', reservation_controller_1.deleteReservation);
exports.default = router;
