import * as chrono from 'chrono-node';

/**
 * Parse natural language voice input to extract task details
 * @param {string} transcript - The transcribed voice input
 * @returns {object} Parsed task details
 */
export function parseVoiceInput(transcript) {
  const lowerTranscript = transcript.toLowerCase();
  
  // Extract title (remove date/time/priority keywords)
  let title = extractTitle(transcript, lowerTranscript);
  
  // Extract due date
  const dueDate = extractDueDate(transcript);
  
  // Extract priority
  const priority = extractPriority(lowerTranscript);
  
  // Extract status (default to "To Do")
  const status = extractStatus(lowerTranscript);
  
  return {
    title: title.trim() || 'Untitled Task',
    description: null,
    status: status,
    priority: priority,
    dueDate: dueDate,
    transcript: transcript,
  };
}

/**
 * Extract task title by removing date/time and priority keywords
 */
function extractTitle(original, lower) {
  let title = original;
  
  // Remove common date/time phrases
  const datePatterns = [
    /\b(by|before|after|on|due|until)\s+\w+\s*\w*/gi,
    /\b(tomorrow|today|yesterday|next week|this week)\b/gi,
    /\b(in|within)\s+\d+\s+(days?|weeks?|months?|hours?)\b/gi,
    /\b\d{1,2}(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(st|nd|rd|th)?\b/gi,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    /\b(next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month)\b/gi,
  ];
  
  datePatterns.forEach(pattern => {
    title = title.replace(pattern, '');
  });
  
  // Remove priority keywords
  const priorityPatterns = [
    /\b(high|low|medium|critical)\s+priority\b/gi,
    /\b(urgent|important|critical)\b/gi,
    /\bpriority\b/gi,
  ];
  
  priorityPatterns.forEach(pattern => {
    title = title.replace(pattern, '');
  });
  
  // Remove common task creation phrases
  const taskPhrases = [
    /^(create|add|make|new|remind me to|i need to|i have to|i should)\s+/i,
    /\s+(task|todo|reminder)$/i,
  ];
  
  taskPhrases.forEach(pattern => {
    title = title.replace(pattern, '');
  });
  
  // Clean up extra spaces
  title = title.replace(/\s+/g, ' ').trim();
  
  return title || original;
}

/**
 * Extract due date from transcript using chrono-node
 */
function extractDueDate(transcript) {
  try {
    const parsed = chrono.parseDate(transcript);
    if (parsed) {
      // Format as ISO string
      return parsed.toISOString();
    }
    
    // Fallback: check for common relative dates
    const lower = transcript.toLowerCase();
    const now = new Date();
    
    if (lower.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      // Try to extract time if mentioned
      const timeMatch = transcript.match(/\b(\d{1,2}):?(\d{2})?\s*(am|pm|evening|morning|afternoon|noon)\b/i);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const isPM = /pm|evening|afternoon/i.test(timeMatch[3] || '');
        const isAM = /am|morning/i.test(timeMatch[3] || '');
        const isNoon = /noon/i.test(timeMatch[3] || '');
        
        if (isNoon) {
          tomorrow.setHours(12, 0, 0, 0);
        } else if (isPM && hour < 12) {
          tomorrow.setHours(hour + 12, 0, 0, 0);
        } else if (isAM && hour === 12) {
          tomorrow.setHours(0, 0, 0, 0);
        } else if (isAM || !isPM) {
          tomorrow.setHours(hour, 0, 0, 0);
        } else {
          tomorrow.setHours(hour, 0, 0, 0);
        }
      } else if (lower.includes('evening')) {
        tomorrow.setHours(18, 0, 0, 0);
      } else if (lower.includes('morning')) {
        tomorrow.setHours(9, 0, 0, 0);
      } else if (lower.includes('afternoon')) {
        tomorrow.setHours(14, 0, 0, 0);
      }
      
      return tomorrow.toISOString();
    }
    
    if (lower.includes('today')) {
      const timeMatch = transcript.match(/\b(\d{1,2}):?(\d{2})?\s*(am|pm|evening|morning|afternoon)\b/i);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const isPM = /pm|evening|afternoon/i.test(timeMatch[3] || '');
        if (isPM && hour < 12) {
          now.setHours(hour + 12, 0, 0, 0);
        } else {
          now.setHours(hour, 0, 0, 0);
        }
      }
      return now.toISOString();
    }
    
    // Check for "in X days"
    const daysMatch = transcript.match(/\bin\s+(\d+)\s+days?\b/i);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + days);
      return futureDate.toISOString();
    }
    
    // Check for "next [day of week]"
    const nextDayMatch = transcript.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (nextDayMatch) {
      const dayName = nextDayMatch[1].toLowerCase();
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = daysOfWeek.indexOf(dayName);
      const currentDay = now.getDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0) {
        daysUntil += 7;
      }
      const nextDate = new Date(now);
      nextDate.setDate(nextDate.getDate() + daysUntil);
      return nextDate.toISOString();
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Extract priority from transcript
 */
function extractPriority(lowerTranscript) {
  if (/\b(critical|urgent|asap|immediately)\b/.test(lowerTranscript)) {
    return 'Critical';
  }
  if (/\b(high\s+priority|high priority|important|high)\b/.test(lowerTranscript)) {
    return 'High';
  }
  if (/\b(low\s+priority|low priority|low|not urgent)\b/.test(lowerTranscript)) {
    return 'Low';
  }
  return 'Medium'; // Default
}

/**
 * Extract status from transcript (defaults to "To Do")
 */
function extractStatus(lowerTranscript) {
  if (/\b(in progress|working on|doing)\b/.test(lowerTranscript)) {
    return 'In Progress';
  }
  if (/\b(done|completed|finished)\b/.test(lowerTranscript)) {
    return 'Done';
  }
  return 'To Do'; // Default
}


