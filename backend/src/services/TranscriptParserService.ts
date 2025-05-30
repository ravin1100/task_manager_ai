import { Task } from '../models/task.model';
import { parseTaskFromText } from './nlp.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google's Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Define a more complete ParsedTask interface that includes all necessary fields
export interface ParsedTask {
  title: string;
  description?: string;
  assignee: string;
  due_date: Date;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'pending' | 'in_progress' | 'completed';
  type: 'manual' | 'transcript';
  isAI?: boolean;
}

interface ExtractedTask {
  taskDescription: string;
  assignee: string;
  deadline: string;
  priority: string;
}

class TranscriptParserService {
  constructor() {
    // No initialization needed for manual algorithm
  }

  /**
   * Extracts tasks from a meeting transcript using Gemini AI
   * @param transcript The meeting transcript to parse
   * @returns Array of parsed tasks
   */
  public async extractTasksFromTranscript(transcript: string): Promise<ParsedTask[]> {
    try {
      // First try with Gemini AI
      const geminiTasks = await this.extractTasksWithGemini(transcript);
      if (geminiTasks.length > 0) {
        return geminiTasks;
      }
      
      // Fallback to rule-based extraction if Gemini fails
      return this.extractTasksWithRules(transcript);
    } catch (error) {
      console.error('Error extracting tasks with Gemini, falling back to rule-based extraction:', error);
      return this.extractTasksWithRules(transcript);
    }
  }
  
  /**
   * Extracts tasks using Google's Gemini AI
   */
  private async extractTasksWithGemini(transcript: string): Promise<ParsedTask[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Extract action items and tasks from the following meeting transcript. 
    For each task, identify:
    1. Task description/title
    2. Assignee (who is responsible)
    3. Due date (if mentioned, or use a reasonable default)
    4. Priority (P1-Critical, P2-High, P3-Medium, P4-Low)
    
    Format the response as a JSON array of objects with these fields:
    [
      {
        "title": "task description",
        "assignee": "person responsible",
        "due_date": "YYYY-MM-DD",
        "priority": "P1"
      }
    ]
    
    Transcript: ${transcript.substring(0, 30000)}`;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      const jsonStr = text.substring(jsonStart, jsonEnd);
      
      const tasks = JSON.parse(jsonStr);
      
      return tasks.map((task: any) => ({
        title: task.title,
        description: task.description || '',
        assignee: task.assignee || 'Unassigned',
        due_date: new Date(task.due_date || new Date().setDate(new Date().getDate() + 7)),
        priority: task.priority || 'P3',
        status: 'todo',
        type: 'transcript' as const
      }));
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return [];
    }
  }
  
  /**
   * Extract tasks using rule-based approach
   * @param transcript The meeting transcript to parse
   * @returns Array of parsed tasks
   */
  private extractTasksWithRules(transcript: string): ParsedTask[] {
    const tasks: ParsedTask[] = [];
    
    // Split transcript into sentences and process each as a potential task
    const sentences = transcript.split(/[.!?]\s+/).filter(sentence => sentence.trim().length > 5);
    
    // Common names that might appear in the transcript
    const knownNames = ['Aman', 'Rajeev', 'Shreya', 'John', 'Jane', 'Alex', 'Sarah', 'Mike'];
    
    for (const sentence of sentences) {
      // Skip sentences that are too short or don't look like task assignments
      if (sentence.length < 5) continue;
      
      try {
        // Check for common patterns in meeting task assignments
        let taskLine = sentence.trim();
        let assignee: string | null = null;
        let taskDescription = taskLine;
        
        // Extract assignee from the beginning of the line (e.g., "Aman you take...")
        for (const name of knownNames) {
          // Check if sentence starts with a name
          if (taskLine.startsWith(name) || taskLine.match(new RegExp(`^[^a-zA-Z]*${name}\\b`, 'i'))) {
            assignee = name;
            
            // Extract the task description by removing the assignee part
            const pattern = new RegExp(`^[^a-zA-Z]*${name}\\s+(you|please|can you|will|should|needs to|has to|must|is going to|would)\\s+`, 'i');
            const match = taskLine.match(pattern);
            
            if (match) {
              taskDescription = taskLine.substring(match[0].length).trim();
            } else {
              // If no connecting words found, try to extract the task after the name
              const simplePattern = new RegExp(`^[^a-zA-Z]*${name}\\s+`, 'i');
              const simpleMatch = taskLine.match(simplePattern);
              if (simpleMatch) {
                taskDescription = taskLine.substring(simpleMatch[0].length).trim();
              }
            }
            break;
          }
        }
        
        // If no name was found at the beginning, look for assignment patterns in the sentence
        if (!assignee) {
          for (const name of knownNames) {
            // Look for patterns like "Ask John to..." or "John will..."
            const patterns = [
              new RegExp(`\\b${name}\\s+(will|should|needs to|has to|must|is going to)\\b`, 'i'),
              new RegExp(`\\bask\\s+${name}\\s+to\\b`, 'i'),
              new RegExp(`\\bassign\\s+to\\s+${name}\\b`, 'i'),
              new RegExp(`\\b${name}'s\\s+responsibility\\b`, 'i')
            ];
            
            for (const pattern of patterns) {
              if (pattern.test(taskLine)) {
                assignee = name;
                break;
              }
            }
            
            if (assignee) break;
          }
        }
        
        // Use the existing TaskParserService to parse the task description
        const parsedTask = parseTaskFromText(taskDescription);
        
        // Create a properly formatted ParsedTask
        const formattedTask: ParsedTask = {
          title: parsedTask.title || taskDescription.substring(0, Math.min(taskDescription.length, 100)),
          description: parsedTask.description,
          assignee: assignee || parsedTask.assignee || 'Unassigned',
          due_date: parsedTask.due_date,
          priority: parsedTask.priority,
          status: 'pending', // Default status
          type: 'transcript', // Set type to transcript for extracted tasks
          isAI: true // Set isAI to true for AI-extracted tasks
        };
        
        // Clean up the task title
        if (formattedTask.title.startsWith('you ') || 
            formattedTask.title.startsWith('please ') || 
            formattedTask.title.startsWith('can you ') ||
            formattedTask.title.startsWith('to ')) {
          formattedTask.title = formattedTask.title.replace(/^(you|please|can you|to)\s+/, '');
        }
        
        // Remove trailing periods and other punctuation
        formattedTask.title = formattedTask.title.replace(/[.,:;!?]\s*$/, '');
        
        // Capitalize the first letter of the title
        if (formattedTask.title.length > 0) {
          formattedTask.title = formattedTask.title.charAt(0).toUpperCase() + formattedTask.title.slice(1);
        }
        
        // Add the task to our list if it has a valid title and assignee
        if (formattedTask.title && formattedTask.title.length > 3) {
          tasks.push(formattedTask);
        }
      } catch (error) {
        // Error parsing line as task
        // Continue with the next line even if this one fails
        console.error('Error parsing line as task:', error);
      }
    }
    
    return tasks;
  }

  /**
   * Converts the AI extracted tasks to the application's ParsedTask format
   */
  private convertToTaskFormat(extractedTasks: ExtractedTask[]): ParsedTask[] {
    return extractedTasks.map(task => {
      // Create a task string in the format that TaskParserService can parse
      const taskString = `${task.taskDescription} ${task.assignee} by ${task.deadline} ${task.priority}`;
      
      // Use the existing TaskParserService to parse the task string
      const parsedTask = parseTaskFromText(taskString);
      
      // Create a properly formatted ParsedTask
      const formattedTask: ParsedTask = {
        title: parsedTask.title,
        description: parsedTask.description,
        assignee: parsedTask.assignee,
        due_date: parsedTask.due_date,
        priority: parsedTask.priority,
        status: 'pending', // Default status
        type: 'transcript', // Set type to transcript for extracted tasks
        isAI: false // Set isAI to false for manually extracted tasks
      };
      
      // Ensure the assignee is set correctly
      if (!formattedTask.assignee && task.assignee) {
        formattedTask.assignee = task.assignee;
      }
      
      // Ensure priority is set correctly
      if (task.priority && ['P1', 'P2', 'P3', 'P4'].includes(task.priority)) {
        formattedTask.priority = task.priority as 'P1' | 'P2' | 'P3' | 'P4';
      }
      
      return formattedTask;
    });
  }
}

export default new TranscriptParserService();
