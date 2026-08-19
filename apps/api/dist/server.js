"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const logger_service_1 = require("./services/logger.service");
const logCleanup_1 = require("./cron/logCleanup");
const PORT = process.env.PORT || 3000;
app_1.default.listen(PORT, () => {
    logger_service_1.logger.info(`Server is running on port ${PORT}`);
    // Iniciar tareas programadas
    (0, logCleanup_1.startLogCleanupCron)();
});
