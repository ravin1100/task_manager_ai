import db from '../config/database';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  assignee: string;
  due_date: Date;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  created_at?: Date;
  updated_at?: Date;
  status?: 'todo' | 'in_progress' | 'done';
  type?: 'manual' | 'transcript';
}

export const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      assignee VARCHAR(100) NOT NULL,
      due_date TIMESTAMP WITH TIME ZONE NOT NULL,
      priority VARCHAR(2) NOT NULL CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
      status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
      type VARCHAR(20) DEFAULT 'manual' CHECK (type IN ('manual', 'transcript')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await db.query(query);
  console.log('Tasks table created or already exists');
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Task> => {
  const { title, description, assignee, due_date, priority, type = 'manual' } = task;
  const result = await db.query(
    'INSERT INTO tasks (title, description, assignee, due_date, priority, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [title, description, assignee, due_date, priority, type]
  );
  return result.rows[0];
};

export const getTasks = async (): Promise<Task[]> => {
  const result = await db.query('SELECT * FROM tasks ORDER BY due_date');
  return result.rows;
};

export const getTaskById = async (id: number): Promise<Task | null> => {
  const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const updateTask = async (id: number, task: Partial<Task>): Promise<Task | null> => {
  const { title, description, assignee, due_date, priority, status } = task;
  const result = await db.query(
    `UPDATE tasks 
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         assignee = COALESCE($3, assignee),
         due_date = COALESCE($4, due_date),
         priority = COALESCE($5, priority),
         status = COALESCE($6, status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $7
     RETURNING *`,
    [title, description, assignee, due_date, priority, status, id]
  );
  return result.rows[0] || null;
};

export const deleteTask = async (id: number): Promise<boolean> => {
  const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
  return (result.rowCount || 0) > 0;
};
