/**
 * useCloudFunction Hook
 * A reusable hook for making HTTP requests to Cloud Functions with state management
 * Similar to react-query but simpler and tailored for our Cloud Functions
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { CloudFunction, getCloudFunctionUrl, getCloudFunctionHeaders } from '@/config/cloudFunctions';

/**
 * Hook options
 */
export interface UseCloudFunctionOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requiresAuth?: boolean;
  autoExecute?: boolean; // Auto-execute on mount (useful for GET requests)
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  initialData?: any;
  enabled?: boolean; // Whether the hook is enabled (default: true)
}

/**
 * Hook state
 */
export interface UseCloudFunctionState<TData = any> {
  data: TData | null;
  loading: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

/**
 * Hook return type
 */
export interface UseCloudFunctionReturn<TData = any, TRequest = any> {
  data: TData | null;
  loading: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  execute: (payload?: TRequest, config?: AxiosRequestConfig) => Promise<TData>;
  refetch: () => Promise<TData>;
  reset: () => void;
  mutate: (newData: TData) => void; // Manually update data
}

/**
 * Main hook for making Cloud Function requests
 * 
 * @example
 * // POST request (manual trigger)
 * const { data, loading, error, execute } = useCloudFunction<ResponseType, RequestType>(
 *   CloudFunction.GENERATE_AUTH_LINK,
 *   { method: 'POST', requiresAuth: false }
 * );
 * 
 * // Execute when needed
 * await execute({ email: 'user@example.com' });
 * 
 * @example
 * // GET request (auto-execute)
 * const { data, loading, refetch } = useCloudFunction<FilesResponse>(
 *   CloudFunction.LIST_FILES,
 *   { method: 'GET', requiresAuth: true, autoExecute: true }
 * );
 * 
 * @example
 * // With callbacks
 * const { execute } = useCloudFunction(
 *   CloudFunction.DELETE_FILE,
 *   {
 *     onSuccess: (data) => console.log('Deleted!', data),
 *     onError: (error) => console.error('Failed:', error),
 *   }
 * );
 */
export function useCloudFunction<TData = any, TRequest = any>(
  functionName: CloudFunction,
  options: UseCloudFunctionOptions = {}
): UseCloudFunctionReturn<TData, TRequest> {
  const {
    method = 'POST',
    requiresAuth = false,
    autoExecute = false,
    onSuccess,
    onError,
    initialData = null,
    enabled = true,
  } = options;

  const [state, setState] = useState<UseCloudFunctionState<TData>>({
    data: initialData,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false,
    isIdle: true,
  });

  const lastPayloadRef = useRef<TRequest | undefined>(undefined);
  const isFirstRenderRef = useRef(true);

  /**
   * Execute the Cloud Function request
   */
  const execute = useCallback(
    async (payload?: TRequest, config?: AxiosRequestConfig): Promise<TData> => {
      if (!enabled) {
        throw new Error('Hook is disabled');
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        isError: false,
        isIdle: false,
      }));

      lastPayloadRef.current = payload;

      try {
        const url = getCloudFunctionUrl(functionName);
        const headers = getCloudFunctionHeaders(requiresAuth);

        const axiosConfig: AxiosRequestConfig = {
          method,
          url,
          headers: {
            ...(headers as Record<string, string>),
            ...(config?.headers as Record<string, string>),
          },
          ...config,
        };

        // Add data/params based on method
        if (method === 'GET' || method === 'DELETE') {
          if (payload) {
            axiosConfig.params = payload;
          }
        } else {
          if (payload) {
            axiosConfig.data = payload;
          }
        }

        const response = await axios(axiosConfig);
        const responseData: TData = response.data;

        setState({
          data: responseData,
          loading: false,
          error: null,
          isSuccess: true,
          isError: false,
          isIdle: false,
        });

        if (onSuccess) {
          onSuccess(responseData);
        }

        return responseData;
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Cloud Function request failed';
        const errorObject = new Error(errorMessage);

        setState({
          data: null,
          loading: false,
          error: errorObject,
          isSuccess: false,
          isError: true,
          isIdle: false,
        });

        if (onError) {
          onError(errorObject);
        }

        throw errorObject;
      }
    },
    [functionName, method, requiresAuth, enabled, onSuccess, onError]
  );

  /**
   * Refetch using the last payload
   */
  const refetch = useCallback(async (): Promise<TData> => {
    return execute(lastPayloadRef.current);
  }, [execute]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      isSuccess: false,
      isError: false,
      isIdle: true,
    });
    lastPayloadRef.current = undefined;
  }, [initialData]);

  /**
   * Manually mutate data (optimistic updates)
   */
  const mutate = useCallback((newData: TData) => {
    setState(prev => ({
      ...prev,
      data: newData,
      isSuccess: true,
      isError: false,
    }));
  }, []);

  /**
   * Auto-execute on mount if enabled
   */
  useEffect(() => {
    if (autoExecute && enabled && isFirstRenderRef.current) {
      execute();
    }
    isFirstRenderRef.current = false;
  }, [autoExecute, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    isSuccess: state.isSuccess,
    isError: state.isError,
    isIdle: state.isIdle,
    execute,
    refetch,
    reset,
    mutate,
  };
}

/**
 * Specialized hook for mutations (POST/PUT/DELETE)
 * Does not auto-execute, always requires manual trigger
 */
export function useCloudFunctionMutation<TData = any, TRequest = any>(
  functionName: CloudFunction,
  options: Omit<UseCloudFunctionOptions, 'autoExecute'> = {}
): UseCloudFunctionReturn<TData, TRequest> {
  return useCloudFunction<TData, TRequest>(functionName, {
    ...options,
    autoExecute: false,
  });
}

/**
 * Specialized hook for queries (GET)
 * Auto-executes by default
 */
export function useCloudFunctionQuery<TData = any, TRequest = any>(
  functionName: CloudFunction,
  options: Omit<UseCloudFunctionOptions, 'method'> = {}
): UseCloudFunctionReturn<TData, TRequest> {
  return useCloudFunction<TData, TRequest>(functionName, {
    ...options,
    method: 'GET',
    autoExecute: options.autoExecute !== undefined ? options.autoExecute : true,
  });
}
