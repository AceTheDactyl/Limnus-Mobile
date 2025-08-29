import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from 'react-native';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Check for environment variable first
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('🔗 Using configured base URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // For development, try to detect the correct URL
  if (Platform.OS === 'web') {
    // On web, use the current origin
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    console.log('🌐 Web platform detected, using:', baseUrl);
    return baseUrl;
  } else {
    // On mobile, try common development URLs
    // First try the Expo tunnel URL if available
    if (process.env.EXPO_PUBLIC_DEV_URL) {
      console.log('📱 Using Expo dev URL:', process.env.EXPO_PUBLIC_DEV_URL);
      return process.env.EXPO_PUBLIC_DEV_URL;
    }
    
    // Fallback to localhost for simulator/emulator
    const fallbackUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
    console.log('📱 Mobile platform detected, using fallback:', fallbackUrl);
    return fallbackUrl;
  }
};

const baseUrl = getBaseUrl();
const trpcUrl = `${baseUrl}/api/trpc`;
console.log('🚀 tRPC client initialized with URL:', trpcUrl);

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        console.log('tRPC fetch:', url, options?.method || 'GET');
        
        const maxRetries = 2; // Reduce retries for faster fallback
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              console.log(`tRPC request timeout (attempt ${attempt})`);
              controller.abort('Request timeout');
            }, 8000); // Increased timeout to 8 seconds
            
            const response = await fetch(url, {
              ...options,
              headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
              },
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            console.log(`tRPC response (attempt ${attempt}):`, response.status);
            
            if (!response.ok) {
              console.error('tRPC fetch error:', response.status, response.statusText);
              
              // Don't retry on client errors (4xx)
              if (response.status >= 400 && response.status < 500) {
                throw new Error(`Client error: ${response.status} ${response.statusText}`);
              }
              
              // Retry on server errors (5xx) or network issues
              if (attempt === maxRetries) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
              }
              
              // Wait before retry with shorter backoff
              await new Promise(resolve => setTimeout(resolve, attempt * 500));
              continue;
            }
            
            return response;
          } catch (error) {
            console.error(`tRPC fetch error (attempt ${attempt}):`, error);
            lastError = error as Error;
            
            // Check if it's a network error or abort error
            const isAbortError = (error as any)?.name === 'AbortError' || 
                               (error as any)?.message?.includes('signal is aborted') ||
                               (error as any)?.message?.includes('AbortError') ||
                               (error as any)?.message?.includes('aborted without reason');
            
            const isNetworkError = (error as any)?.name === 'TypeError' && 
                                 ((error as any)?.message?.includes('Failed to fetch') ||
                                  (error as any)?.message?.includes('Network request failed') ||
                                  (error as any)?.message?.includes('fetch') ||
                                  (error as any)?.message?.includes('ERR_NETWORK'));
            
            if (isNetworkError) {
              console.warn(`Network error detected on attempt ${attempt} - backend may not be running or accessible`);
            }
            
            if (isAbortError) {
              console.warn(`Request was aborted on attempt ${attempt} - likely due to timeout`);
            }
            
            if (attempt === maxRetries) {
              // Provide a more helpful error message
              if (isNetworkError || isAbortError) {
                console.error('All connection attempts failed. Backend server is not accessible.');
                // Don't throw error, return a mock response to prevent app crash
                console.warn('🔌 Backend server is not running. Please start the backend server.');
                console.warn('💡 To start the backend: cd to project root and run: node backend/start-server.js');
                return new Response(JSON.stringify({ 
                  error: 'Backend server not running', 
                  offline: true,
                  message: 'Please start the backend server to enable full functionality',
                  instructions: 'Run: node backend/start-server.js'
                }), {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              throw lastError;
            }
            
            // Wait before retry with exponential backoff
            const delay = Math.min(attempt * 1000, 3000); // Max 3 second delay
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        
        throw lastError || new Error('Connection failed after all retries');
      },
    }),
  ],
});