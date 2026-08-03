import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadFileToS3 } from '../services/s3.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authenticate, upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se subió ninguna imagen' });
      return;
    }

    const imageUrl = await uploadFileToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ message: 'Error interno al subir la imagen' });
  }
});

export default router;
