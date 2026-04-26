import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  originalError?: any;
}

export class ApiErrorHandler extends Error implements ApiError {
  message: string;
  status?: number;
  originalError?: any;

  constructor(message: string, status?: number, originalError?: any) {
    super(message);
    this.message = message;
    this.status = status;
    this.originalError = originalError;
    Object.setPrototypeOf(this, ApiErrorHandler.prototype);
  }
}

export const handleApiError = (error: unknown, context: string): never => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || error.message || 'Unknown error';

    const errorMessage = `${context}: ${message}${status ? ` (${status})` : ''}`;
    console.error(errorMessage, { error: error.response?.data, context });

    throw new ApiErrorHandler(errorMessage, status, error);
  }

  if (error instanceof Error) {
    console.error(`${context}: ${error.message}`);
    throw new ApiErrorHandler(`${context}: ${error.message}`, undefined, error);
  }

  const errorMessage = `${context}: ${String(error)}`;
  console.error(errorMessage);
  throw new ApiErrorHandler(errorMessage, undefined, error);
};

export const buildQueryParams = (params: Record<string, any>): Record<string, any> => {
  return {
    q: JSON.stringify(params),
  };
};
