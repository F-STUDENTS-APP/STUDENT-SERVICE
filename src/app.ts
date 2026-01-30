import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import dotenv from 'dotenv';
import logger from './config/logger';
import { sendError } from './utils/response';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const swaggerOptions = {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
  ],
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
import studentRoutes from './routes/student.routes';
import classRoutes from './routes/class.routes';
import academicYearRoutes from './routes/academic-year.routes';

app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/academic-years', academicYearRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', service: 'student-service' });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  sendError(res, status, message);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`Student Service listening on port ${port}`);
  });
}

export default app;
