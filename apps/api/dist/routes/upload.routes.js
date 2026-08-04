"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const s3_service_1 = require("../services/s3.service");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/', auth_middleware_1.authenticate, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No se subió ninguna imagen' });
            return;
        }
        const imageUrl = await (0, s3_service_1.uploadFileToS3)(req.file.buffer, req.file.originalname, req.file.mimetype);
        res.status(200).json({ imageUrl });
    }
    catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ message: 'Error interno al subir la imagen' });
    }
});
exports.default = router;
