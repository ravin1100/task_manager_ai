import { Task } from '../models/task.model';

// Enhanced date parsing function that handles multiple date formats
const parseDate = (text: string): { date: Date | null; remainingText: string } => {
  const now = new Date();
  let remainingText = text.trim();
  let resultDate: Date | null = null;

  // Helper to check if a date is valid
  const isValidDate = (d: Date) => !isNaN(d.getTime()) && d instanceof Date;

  // Helper to create a date with time set to end of day
  const createDateWithTime = (year: number, month: number, day: number, hours = 23, minutes = 59, seconds = 59): Date => {
    const date = new Date(year, month, day, hours, minutes, seconds);
    // Handle invalid dates (like Feb 30)
    if (date.getMonth() !== month) {
      date.setDate(0); // Last day of previous month
    }
    return date;
  };

  // Try to parse dates in format "by [date]" or "due [date]"
  const datePatterns = [
    // Today
    {
      pattern: /(?:by|due|on|before|until)\s+(?:today|tonight)/i,
      handler: () => createDateWithTime(now.getFullYear(), now.getMonth(), now.getDate())
    },
    // Tomorrow
    {
      pattern: /(?:by|due|on|before|until)\s+tomorrow(?:\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i,
      handler: (match: RegExpExecArray) => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        
        if (match[1]) {
          let hours = parseInt(match[1]);
          const minutes = match[2] ? parseInt(match[2]) : 0;
          const period = match[3]?.toLowerCase();
          
          if (period === 'pm' && hours < 12) hours += 12;
          if (period === 'am' && hours === 12) hours = 0;
          
          date.setHours(hours, minutes, 0, 0);
        } else {
          // Default to end of day if no time specified
          date.setHours(23, 59, 59, 0);
        }
        return date;
      }
    },
    // Next [day of week]
    {
      pattern: /(?:by|due|on|before|until)\s+next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      handler: (match: RegExpExecArray) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDay = days.indexOf(match[1].toLowerCase());
        const date = new Date();
        const currentDay = date.getDay();
        const daysToAdd = ((targetDay + 7) - currentDay) % 7 || 7; // Get to next occurrence
        date.setDate(date.getDate() + daysToAdd);
        date.setHours(23, 59, 59, 0); // End of day
        return date;
      }
    },
    // Month name (e.g., "January 25th" or "25th of January")
    {
      pattern: /(\d{1,2})(?:st|nd|rd|th)?(?:\s+of)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s*,\s*(\d{4}))?/i,
      handler: (match: RegExpExecArray) => {
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const month = months.findIndex(m => m.startsWith(match[2].toLowerCase()));
        const day = parseInt(match[1]);
        const year = match[3] ? parseInt(match[3]) : (new Date()).getFullYear();
        return createDateWithTime(year, month, day);
      }
    },
    // Date with slashes or dashes (MM/DD/YYYY, DD-MM-YYYY, etc.)
    {
      pattern: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      handler: (match: RegExpExecArray) => {
        let day, month, year;
        
        // If year is 4 digits, it's likely YYYY-MM-DD or DD/MM/YYYY
        if (match[3].length === 4) {
          if (match[0].includes('/')) {
            // Assume DD/MM/YYYY
            day = parseInt(match[1]);
            month = parseInt(match[2]) - 1;
            year = parseInt(match[3]);
          } else {
            // Assume YYYY-MM-DD
            year = parseInt(match[1]);
            month = parseInt(match[2]) - 1;
            day = parseInt(match[3]);
          }
        } else {
          // Assume DD/MM/YY or MM/DD/YY based on first part
          const first = parseInt(match[1]);
          const second = parseInt(match[2]);
          
          if (first > 12) {
            // DD/MM/YY
            day = first;
            month = second - 1;
            year = 2000 + parseInt(match[3]);
          } else if (second > 12) {
            // MM/DD/YY
            month = first - 1;
            day = second;
            year = 2000 + parseInt(match[3]);
          } else {
            // Ambiguous, assume DD/MM/YY
            day = first;
            month = second - 1;
            year = 2000 + parseInt(match[3]);
          }
        }
        
        return createDateWithTime(year, month, day);
      }
    },
    // Time only (2pm, 14:30, etc.) - defaults to today
    {
      pattern: /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
      handler: (match: RegExpExecArray) => {
        const date = new Date();
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const period = match[3]?.toLowerCase();
        
        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        date.setHours(hours, minutes, 0, 0);
        return date;
      }
    }
  ];
  
  // Try each pattern until we find a match
  for (const { pattern, handler } of datePatterns) {
    const match = pattern.exec(remainingText);
    if (match) {
      try {
        const date = handler(match);
        if (isValidDate(date)) {
          resultDate = date;
          remainingText = (
            remainingText.substring(0, match.index) + 
            remainingText.substring(match.index + match[0].length)
          ).trim();
          break;
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    }
  }
  
  // If no date found, default to one week from now
  if (!resultDate) {
    resultDate = new Date();
    resultDate.setDate(resultDate.getDate() + 7);
  }
  
  return {
    date: resultDate,
    remainingText
  };
};

export const parseTaskFromText = (text: string): Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'> => {
  // Make a copy of the original text for processing
  let remainingText = text.trim();
  let title = remainingText;
  let assignee = 'Unassigned';
  let dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // Default to 1 week from now
  let priority: 'P1' | 'P2' | 'P3' | 'P4' = 'P3';
  let description = '';

  // Extract priority (P1, P2, P3, P4)
  const priorityMatch = remainingText.match(/\b(priority\s*:?\s*)?(P[1-4])\b/i);
  if (priorityMatch) {
    priority = priorityMatch[2].toUpperCase() as 'P1' | 'P2' | 'P3' | 'P4';
    remainingText = remainingText.replace(priorityMatch[0], '').trim();
  }
  
  // Extract assignee (after "to" or "for" or "assign to" or "assigned to")
  const assigneeMatch = remainingText.match(/(?:to|for|assign(?:ed)? to|assignee)\s*:?\s*([A-Za-z]+)(?:\s|$)/i);
  if (assigneeMatch) {
    assignee = assigneeMatch[1].trim();
    remainingText = remainingText.replace(assigneeMatch[0], '').trim();
  }
  
  // Extract date (handle multiple date formats)
  const dateMatch = remainingText.match(/(?:by|due|on|before|until)\s*(?:on\s*)?(?:the\s*)?(\d{1,2}(?:st|nd|rd|th)?(?:\s+of)?\s*(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s*,\s*\d{4})?|\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|tomorrow|next\s+\w+)/i);
  
  if (dateMatch) {
    const dateStr = dateMatch[1];
    const { date } = parseDate(`by ${dateStr}`);
    if (date) {
      dueDate = date;
      remainingText = remainingText.replace(dateMatch[0], '').trim();
    }
  }
  
  // Extract description (after a colon or dash)
  const descriptionMatch = remainingText.match(/[:\-]\s*(.+)/);
  if (descriptionMatch) {
    description = descriptionMatch[1].trim();
    remainingText = remainingText.replace(descriptionMatch[0], '').trim();
  }
  
  // The remaining text is the title
  title = remainingText.replace(/\s+/g, ' ').trim() || 'Untitled Task';
  
  // If title is too long, split into title and description
  if (title.length > 50 && !description) {
    const splitIndex = title.lastIndexOf(' ', 50);
    description = title.substring(splitIndex + 1);
    title = title.substring(0, splitIndex);
  }
  
  return {
    title: title || 'Untitled Task',
    description: description || '',
    assignee,
    due_date: dueDate,
    priority,
  };
};

// Helper function to format date for display
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};
