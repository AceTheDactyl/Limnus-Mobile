import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // When running on Rork platform, the backend is integrated
  // The backend routes are available at /api on the same origin
  
  if (Platform.OS === 'web') {
    // On web (Rork platform), use the current origin
    // The Rork platform provides the backend at the same origin
    if (typeof window !== 'undefined') {
      // Use the current origin - this works for both rork.com and local development
      const origin = window.location.origin;
      console.log('Web platform - using origin:', origin);
      return origin;
    }
    // Fallback for SSR or when window is not available
    return '';
  } else {
    // On mobile (React Native), we need to connect to the Rork backend
    // Check for environment variable first (for local development)
    if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
      console.log('Mobile - using configured URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
      return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
    }
    
    // Default to the Rork platform URL for mobile apps
    // Mobile apps need the full URL to connect to the backend
    const rorkUrl = 'https://rork.com';
    console.log('Mobile - using Rork platform URL:', rorkUrl);
    return rorkUrl;
  }
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        console.log('tRPC fetch:', url, options?.method || 'GET');
        console.log('Base URL being used:', getBaseUrl());
        
        // Get authentication token for protected routes
        const deviceToken = await AsyncStorage.getItem('device_token');
        const deviceId = await AsyncStorage.getItem('consciousness_device_id');
        
        const maxRetries = 3; // Allow more retries for better reliability
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              console.log(`tRPC request timeout (attempt ${attempt})`);
              controller.abort('Request timeout');
            }, 15000); // Increased timeout to 15 seconds for better reliability
            
            const response = await fetch(url, {
              ...options,
              headers: {
                'Content-Type': 'application/json',
                ...(deviceToken && { 'Authorization': `Bearer ${deviceToken}` }),
                ...(deviceId && { 'X-Device-ID': deviceId }),
                ...options?.headers,
              },
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            console.log(`tRPC response (attempt ${attempt}):`, response.status);
            
            if (!response.ok) {
              console.error('tRPC fetch error:', response.status, response.statusText);
              
              // Don't retry on client errors (4xx) except 401 (auth errors)
              if (response.status >= 400 && response.status < 500 && response.status !== 401) {
                throw new Error(`Client error: ${response.status} ${response.statusText}`);
              }
              
              // Handle 401 auth errors by clearing token
              if (response.status === 401) {
                console.warn('Authentication failed, clearing stored token');
                await AsyncStorage.removeItem('device_token');
                throw new Error('Authentication failed - token cleared');
              }
              
              // Retry on server errors (5xx) or network issues
              if (attempt === maxRetries) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
              }
              
              // Wait before retry with exponential backoff
              await new Promise(resolve => setTimeout(resolve, Math.min(attempt * 1000, 3000)));
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
                return new Response(JSON.stringify({ 
                  error: 'Backend unavailable', 
                  offline: true,
                  authenticated: !!deviceToken 
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