import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import * as taskController from '../controllers/task.controller';

const router = Router();

// Helper to wrap async/await route handlers with proper error handling
const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<void | Response>
): RequestHandler => 
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res))
      .then(() => next())
      .catch(next);
  };

// Create a new task from natural language
router.post('/', asyncHandler(taskController.createTask));

// Process transcript and extract tasks
router.post('/transcript', asyncHandler(taskController.processTranscript));

// Get task statistics for dashboard
router.get('/stats', asyncHandler(taskController.getTaskStats));

// Get all tasks
router.get('/', asyncHandler(taskController.getTasks));

// Get a single task by ID
router.get('/:id', asyncHandler(taskController.getTask));

// Update a task
router.put('/:id', asyncHandler(taskController.updateTask));

// Delete a task
router.delete('/:id', asyncHandler(taskController.deleteTask));

export default router;
