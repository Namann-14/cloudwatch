import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import { parseFile } from '../services/parser';
import { generateSummary } from '../services/llm';
import { sendSummaryEmail } from '../services/email';

export const uploadRouter = Router();

// ── Multer configuration ────────────────────────────────────────────────────

const ALLOWED_MIMES = new Set([
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const ALLOWED_EXTENSIONS = new Set(['.csv', '.xlsx']);

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIMES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .csv and .xlsx files are accepted.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
});

// ── Input validation ────────────────────────────────────────────────────────

const validateUpload = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('A valid recipient email address is required.'),
];

// ── Route ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload sales data and receive an AI summary by email
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - email
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Sales data file (.csv or .xlsx, max 5 MB)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address for the AI summary
 *     responses:
 *       200:
 *         description: Summary generated and sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error (invalid file type, missing email, empty data)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error (LLM or email failure)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
uploadRouter.post(
  '/upload',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ success: false, error: 'File exceeds the 5 MB limit.' });
          return;
        }
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      if (err) {
        res.status(400).json({ success: false, error: (err as Error).message });
        return;
      }
      next();
    });
  },
  validateUpload,
  async (req: Request, res: Response): Promise<void> => {
    // 1. Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: errors.array()[0].msg });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded.' });
      return;
    }

    const { email } = req.body as { email: string };

    try {
      // 2. Parse the uploaded file
      const parsedData = parseFile(req.file.buffer, req.file.originalname);

      // 3. Generate AI summary via Gemini
      const summary = await generateSummary(parsedData);

      // 4. Send the summary to the recipient email
      await sendSummaryEmail(email, summary);

      res.json({
        success: true,
        message: `Summary generated and sent to ${email}.`,
        summary,
      });
    } catch (err) {
      console.error('[upload] Error:', err);
      let message = 'An unexpected error occurred.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const e = err as { text?: string; message?: string; status?: number };
        message = e.message ?? e.text ?? JSON.stringify(err);
      }
      res.status(500).json({ success: false, error: message });
    }
  },
);
