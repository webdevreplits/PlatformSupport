// Spark Log Parser - Extracts errors, exceptions, and stack traces from Spark logs

export interface SparkError {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  taskKey?: string;
  timestamp?: string;
}

/**
 * Parse Spark errors from event_details JSON field
 * Event details may contain error messages, exceptions, and stack traces
 */
export function parseSparkErrors(taskRunLogs: any[]): SparkError[] {
  const errors: SparkError[] = [];

  for (const log of taskRunLogs) {
    if (!log.event_details) continue;

    const taskKey = log.task_key || 'unknown';
    const timestamp = log.period_end_time || log.period_start_time;

    try {
      // Parse event_details if it's a JSON string
      const eventDetails = typeof log.event_details === 'string' 
        ? JSON.parse(log.event_details)
        : log.event_details;

      // Extract error information from various possible locations
      const errorInfo = extractErrorFromEventDetails(eventDetails);
      
      if (errorInfo) {
        errors.push({
          errorType: errorInfo.type,
          errorMessage: errorInfo.message,
          stackTrace: errorInfo.stackTrace,
          taskKey,
          timestamp,
        });
      }

      // Also check for termination code mapping
      if (log.termination_code && !errorInfo) {
        const terminationError = mapTerminationCodeToError(log.termination_code);
        if (terminationError) {
          errors.push({
            errorType: terminationError.type,
            errorMessage: terminationError.message,
            taskKey,
            timestamp,
          });
        }
      }
    } catch (e) {
      // If event_details isn't JSON, treat it as plain text error
      if (typeof log.event_details === 'string' && log.event_details.length > 0) {
        const errorMatch = extractErrorFromPlainText(log.event_details);
        if (errorMatch) {
          errors.push({
            errorType: errorMatch.type,
            errorMessage: errorMatch.message,
            stackTrace: errorMatch.stackTrace,
            taskKey,
            timestamp,
          });
        }
      }
    }
  }

  return errors;
}

/**
 * Extract error from structured event_details object
 */
function extractErrorFromEventDetails(details: any): { type: string; message: string; stackTrace?: string } | null {
  // Common Spark error locations in event_details
  
  // 1. Check for exception in error field
  if (details.error) {
    return {
      type: details.error.type || details.error.exception_class || 'Spark Error',
      message: details.error.message || details.error.description || String(details.error),
      stackTrace: details.error.stack_trace || details.error.stackTrace,
    };
  }

  // 2. Check for exception field
  if (details.exception) {
    return {
      type: details.exception.class || 'Spark Exception',
      message: details.exception.message || String(details.exception),
      stackTrace: details.exception.stackTrace,
    };
  }

  // 3. Check for failure_reason
  if (details.failure_reason) {
    return {
      type: 'Task Failure',
      message: details.failure_reason,
    };
  }

  // 4. Check for error_message
  if (details.error_message) {
    return {
      type: 'Error',
      message: details.error_message,
    };
  }

  // 5. Check for state_message with error
  if (details.state_message && details.state_message.toLowerCase().includes('error')) {
    return {
      type: 'State Error',
      message: details.state_message,
    };
  }

  return null;
}

/**
 * Extract error from plain text logs (fallback)
 */
function extractErrorFromPlainText(text: string): { type: string; message: string; stackTrace?: string } | null {
  // Look for common Spark exception patterns
  const exceptionPattern = /([A-Za-z.]+Exception):\s*(.+?)(?=\n\s*at|$)/;
  const match = text.match(exceptionPattern);
  
  if (match) {
    const exceptionType = match[1];
    const message = match[2].trim();
    
    // Try to extract stack trace
    const stackTracePattern = /\n\s*at\s+.+/g;
    const stackTraceMatches = text.match(stackTracePattern);
    const stackTrace = stackTraceMatches ? stackTraceMatches.join('\n') : undefined;
    
    return {
      type: exceptionType,
      message,
      stackTrace,
    };
  }

  // Look for ERROR level logs
  const errorLogPattern = /ERROR\s+(.+?):\s*(.+)/;
  const errorMatch = text.match(errorLogPattern);
  
  if (errorMatch) {
    return {
      type: errorMatch[1],
      message: errorMatch[2],
    };
  }

  return null;
}

/**
 * Map Databricks termination codes to human-readable errors
 */
function mapTerminationCodeToError(code: string): { type: string; message: string } | null {
  const codeMap: Record<string, { type: string; message: string }> = {
    'RUN_EXECUTION_ERROR': {
      type: 'Execution Error',
      message: 'The task failed during execution. Check task logs for specific error details.',
    },
    'CLUSTER_ERROR': {
      type: 'Cluster Error',
      message: 'The cluster encountered an error or failed to start properly.',
    },
    'CLOUD_FAILURE': {
      type: 'Cloud Infrastructure Failure',
      message: 'The cloud provider infrastructure encountered an issue.',
    },
    'RESOURCE_LIMIT_EXCEEDED': {
      type: 'Resource Limit Exceeded',
      message: 'The job exceeded resource limits (memory, CPU, or storage).',
    },
    'UNAUTHORIZED': {
      type: 'Authorization Error',
      message: 'The job does not have permission to access required resources.',
    },
    'INVALID_PARAMETER_VALUE': {
      type: 'Configuration Error',
      message: 'Invalid parameter or configuration value provided to the job.',
    },
  };

  return codeMap[code] || null;
}

/**
 * Format errors for display in AI analysis
 */
export function formatSparkErrorsForAI(errors: SparkError[]): string {
  if (errors.length === 0) {
    return 'No specific Spark errors extracted from logs.';
  }

  return errors.map((error, idx) => {
    let formatted = `\n${idx + 1}. ${error.errorType}: ${error.errorMessage}`;
    if (error.taskKey) {
      formatted += `\n   Task: ${error.taskKey}`;
    }
    if (error.timestamp) {
      formatted += `\n   Time: ${error.timestamp}`;
    }
    if (error.stackTrace) {
      // Truncate very long stack traces
      const truncated = error.stackTrace.length > 500 
        ? error.stackTrace.substring(0, 500) + '...[truncated]'
        : error.stackTrace;
      formatted += `\n   Stack Trace: ${truncated}`;
    }
    return formatted;
  }).join('\n');
}
