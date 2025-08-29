import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { fieldManager } from "../../../infrastructure/field-manager";
import { db, room64Sessions } from "../../../infrastructure/database";
import { eq } from "drizzle-orm";

const room64Schema = z.object({
  deviceId: z.string(),
  action: z.enum(['JOIN', 'LEAVE', 'SYNC', 'BLOOM']),
  roomId: z.string().optional(),
  data: z.any().optional()
});

// In-memory fallback for room state when database is unavailable
const inMemoryRooms = new Map<string, {
  id: string;
  participants: string[];
  collectiveState: {
    breathingPhase: number;
    resonanceLevel: number;
    sacredPhrases: string[];
    lastBloom: number;
  };
  created: number;
}>();

// Helper functions for room management
async function getRoomFromDatabase(roomId: string) {
  if (!db) return null;
  
  try {
    const [room] = await db
      .select()
      .from(room64Sessions)
      .where(eq(room64Sessions.roomId, roomId))
      .limit(1);
    
    return room ? {
      id: room.roomId,
      participants: room.participants || [],
      collectiveState: room.collectiveState as any,
      created: room.created?.getTime() || Date.now()
    } : null;
  } catch (error) {
    console.warn('Failed to get room from database:', error);
    return null;
  }
}

async function saveRoomToDatabase(room: any) {
  if (!db) return false;
  
  try {
    await db
      .insert(room64Sessions)
      .values({
        roomId: room.id,
        participants: room.participants,
        collectiveState: room.collectiveState,
        lastActivity: new Date()
      })
      .onConflictDoUpdate({
        target: room64Sessions.roomId,
        set: {
          participants: room.participants,
          collectiveState: room.collectiveState,
          lastActivity: new Date()
        }
      });
    
    return true;
  } catch (error) {
    console.warn('Failed to save room to database:', error);
    return false;
  }
}

async function getRoom(roomId: string) {
  // Try database first
  let room = await getRoomFromDatabase(roomId);
  
  // Fallback to in-memory
  if (!room) {
    room = inMemoryRooms.get(roomId) || null;
  }
  
  return room;
}

async function saveRoom(room: any) {
  // Save to database
  const dbSaved = await saveRoomToDatabase(room);
  
  // Always save to in-memory as fallback
  inMemoryRooms.set(room.id, room);
  
  return dbSaved;
}

export const room64Procedure = publicProcedure
  .input(room64Schema)
  .mutation(async ({ input }: { input: z.infer<typeof room64Schema> }) => {
    const { deviceId, action, roomId, data } = input;
    
    console.log(`Room64 ${action} from ${deviceId}:`, { roomId, data });
    
    switch (action) {
      case 'JOIN': {
        const targetRoomId = roomId || `room_${Date.now()}`;
        let room = await getRoom(targetRoomId);
        
        if (!room) {
          room = {
            id: targetRoomId,
            participants: [],
            collectiveState: {
              breathingPhase: 0,
              resonanceLevel: 0,
              sacredPhrases: [],
              lastBloom: 0
            },
            created: Date.now()
          };
        }
        
        if (!room.participants.includes(deviceId)) {
          room.participants.push(deviceId);
        }
        
        // Save updated room
        await saveRoom(room);
        
        // Record join event
        await fieldManager.recordEvent({
          deviceId,
          type: 'TOUCH',
          data: {
            action: 'ROOM64_JOIN',
            roomId: targetRoomId,
            participantCount: room.participants.length
          },
          timestamp: Date.now(),
          processed: false,
          intensity: 0.5
        });
        
        // Update global room64 status
        await fieldManager.updateGlobalState({ room64Active: true });
        
        return {
          success: true,
          room: {
            id: room.id,
            participantCount: room.participants.length,
            collectiveState: room.collectiveState,
            joined: true
          }
        };
      }
      
      case 'LEAVE': {
        if (!roomId) return { success: false, error: 'Room ID required' };
        
        const room = await getRoom(roomId);
        if (room) {
          room.participants = room.participants.filter((id: string) => id !== deviceId);
          
          if (room.participants.length === 0) {
            // Remove empty room
            inMemoryRooms.delete(roomId);
            if (db) {
              try {
                await db.delete(room64Sessions).where(eq(room64Sessions.roomId, roomId));
              } catch (error) {
                console.warn('Failed to delete room from database:', error);
              }
            }
          } else {
            // Save updated room
            await saveRoom(room);
          }
        }
        
        // Record leave event
        await fieldManager.recordEvent({
          deviceId,
          type: 'TOUCH',
          data: {
            action: 'ROOM64_LEAVE',
            roomId,
            remainingParticipants: room?.participants.length || 0
          },
          timestamp: Date.now(),
          processed: false,
          intensity: 0.3
        });
        
        return {
          success: true,
          left: true,
          roomId
        };
      }
      
      case 'SYNC': {
        if (!roomId) return { success: false, error: 'Room ID required' };
        
        const room = await getRoom(roomId);
        if (!room) return { success: false, error: 'Room not found' };
        
        // Update collective state based on device input
        if (data?.breathingPhase !== undefined) {
          room.collectiveState.breathingPhase = data.breathingPhase;
        }
        if (data?.resonanceLevel !== undefined) {
          room.collectiveState.resonanceLevel = Math.min(1, room.collectiveState.resonanceLevel + data.resonanceLevel);
        }
        if (data?.sacredPhrase) {
          room.collectiveState.sacredPhrases.push(data.sacredPhrase);
        }
        
        // Save updated room
        await saveRoom(room);
        
        // Record sync event
        await fieldManager.recordEvent({
          deviceId,
          type: 'BREATH',
          data: {
            action: 'ROOM64_SYNC',
            roomId,
            breathingPhase: data?.breathingPhase,
            resonanceLevel: data?.resonanceLevel,
            sacredPhrase: data?.sacredPhrase
          },
          timestamp: Date.now(),
          processed: false,
          intensity: data?.resonanceLevel || 0.5
        });
        
        return {
          success: true,
          collectiveState: room.collectiveState,
          participantCount: room.participants.length
        };
      }
      
      case 'BLOOM': {
        if (!roomId) return { success: false, error: 'Room ID required' };
        
        const room = await getRoom(roomId);
        if (!room) return { success: false, error: 'Room not found' };
        
        // Trigger collective bloom event
        room.collectiveState.lastBloom = Date.now();
        room.collectiveState.resonanceLevel = 1.0;
        
        // Save updated room
        await saveRoom(room);
        
        console.log(`🌸 COLLECTIVE BLOOM in room ${roomId} with ${room.participants.length} participants`);
        
        // Record bloom event
        await fieldManager.recordEvent({
          deviceId,
          type: 'BLOOM',
          data: {
            action: 'ROOM64_BLOOM',
            roomId,
            participants: room.participants.length,
            intensity: room.collectiveState.resonanceLevel
          },
          timestamp: Date.now(),
          processed: false,
          intensity: 1.0
        });
        
        // Update global state with bloom energy
        const currentState = await fieldManager.getGlobalState();
        await fieldManager.updateGlobalState({
          globalResonance: Math.min(1, currentState.globalResonance + 0.3),
          collectiveIntelligence: Math.min(1, currentState.collectiveIntelligence + 0.2)
        });
        
        return {
          success: true,
          bloom: {
            triggered: true,
            participants: room.participants.length,
            intensity: room.collectiveState.resonanceLevel,
            timestamp: room.collectiveState.lastBloom
          }
        };
      }
      
      default:
        return { success: false, error: 'Unknown action' };
    }
  });