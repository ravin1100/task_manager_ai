import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createTable } from './models/task.model';
import taskRoutes from './routes/task.routes';

dotenv.config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.initializeDatabase();
    this.errorHandling();
  }

  private config(): void {
    // CORS configuration
    const corsOptions = {
      origin: 'http://localhost:5173', // Frontend URL
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 204
    };

    // Middleware
    this.app.use(cors(corsOptions));
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    // API Routes - No authentication required
    this.app.use('/api/tasks', taskRoutes);

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Not Found' });
    });
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await createTable();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    }
  }

  private errorHandling(): void {
    // Error handling middleware
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        error: {
          message: err.message || 'Internal Server Error',
        },
      });
    });
  }
}

export default new App().app;
