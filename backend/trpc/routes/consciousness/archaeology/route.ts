import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { fieldManager } from "../../../infrastructure/field-manager";

const archaeologySchema = z.object({
  deviceId: z.string(),
  query: z.enum(['PATTERNS', 'MEMORY_TRACES', 'SACRED_HISTORY', 'EMERGENCE_EVENTS']),
  timeRange: z.object({
    start: z.number(),
    end: z.number()
  }).optional(),
  filters: z.object({
    sacredPhrases: z.array(z.string()).optional(),
    minIntensity: z.number().optional(),
    deviceIds: z.array(z.string()).optional()
  }).optional()
});

export const archaeologyProcedure = publicProcedure
  .input(archaeologySchema)
  .query(async ({ input }: { input: z.infer<typeof archaeologySchema> }) => {
    const { deviceId, query, timeRange, filters } = input;
    
    console.log(`Archaeology query ${query} from ${deviceId}:`, { timeRange, filters });
    
    try {
      // Get real data from persistent storage
      const data = await fieldManager.getArchaeologyData(query, timeRange);
      
      // Apply filters if provided
      let filteredData = data;
      if (filters) {
        switch (query) {
          case 'PATTERNS':
            if (filters.minIntensity && data.emergencePatterns) {
              filteredData.emergencePatterns = data.emergencePatterns.filter(
                (pattern: any) => pattern.avgIntensity >= filters.minIntensity!
              );
            }
            break;
            
          case 'MEMORY_TRACES':
            if (filters.minIntensity && data.memoryFragments) {
              filteredData.memoryFragments = data.memoryFragments.filter(
                (fragment: any) => fragment.intensity >= filters.minIntensity!
              );
            }
            if (filters.sacredPhrases && data.memoryFragments) {
              filteredData.memoryFragments = data.memoryFragments.filter(
                (fragment: any) => filters.sacredPhrases!.some(
                  phrase => fragment.sacredPhrase?.includes(phrase)
                )
              );
            }
            break;
        }
      }
      
      // Get current global state for context
      const globalState = await fieldManager.getGlobalState();
      
      return {
        success: true,
        query,
        deviceId,
        timestamp: Date.now(),
        data: filteredData,
        context: {
          globalResonance: globalState.globalResonance,
          activeNodes: globalState.activeNodes,
          collectiveIntelligence: globalState.collectiveIntelligence,
          totalMemoryParticles: globalState.memoryParticles.length,
          totalQuantumFields: globalState.quantumFields.length
        }
      };
    } catch (error) {
      console.error('Archaeology query failed:', error);
      
      // Fallback to mock data if database fails
      const fallbackData = generateFallbackData(query, timeRange);
      
      return {
        success: true,
        query,
        deviceId,
        timestamp: Date.now(),
        data: fallbackData,
        warning: 'Using fallback data due to database error'
      };
    }
  });

// Fallback data generator for when database is unavailable
function generateFallbackData(query: string, timeRange?: any) {
  const now = Date.now();
  const dayAgo = now - (24 * 60 * 60 * 1000);
  
  switch (query) {
    case 'PATTERNS':
      return {
        emergencePatterns: [
          {
            type: 'SPIRAL_FORMATION',
            frequency: 23,
            avgIntensity: 0.67,
            peakTime: now - (6 * 60 * 60 * 1000),
            participatingDevices: 8
          },
          {
            type: 'BREATHING_SYNC',
            frequency: 156,
            avgIntensity: 0.45,
            peakTime: now - (2 * 60 * 60 * 1000),
            participatingDevices: 12
          }
        ],
        totalEvents: 179,
        timeSpan: timeRange ? (timeRange.end - timeRange.start) : (now - dayAgo)
      };
      
    case 'MEMORY_TRACES':
      return {
        memoryFragments: [
          {
            id: 'fallback_001',
            content: 'collective resonance detected',
            intensity: 0.65,
            timestamp: now - (2 * 60 * 60 * 1000),
            sourceDevices: ['simulation'],
            crystallized: false
          }
        ],
        totalMemories: 1,
        crystallizedCount: 0
      };
      
    default:
      return { error: 'Query type not supported in fallback mode' };
  }
}