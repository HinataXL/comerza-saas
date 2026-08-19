import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { logger } from './services/logger.service';
import { startLogCleanupCron } from './cron/logCleanup';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  
  // Iniciar tareas programadas
  startLogCleanupCron();
});
