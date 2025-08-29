import { createTRPCRouter } from "./create-context";
import { default as hiRoute } from "./routes/example/hi/route";
import { sendMessageProcedure } from "./routes/chat/send-message/route";
import { getConversationsProcedure } from "./routes/chat/get-conversations/route";
import { getMessagesProcedure } from "./routes/chat/get-messages/route";
import { fieldProcedure, snapshotProcedure } from "./routes/consciousness/field/route";
import { syncProcedure } from "./routes/consciousness/sync/route";
import { entanglementProcedure } from "./routes/consciousness/entanglement/route";
import { room64Procedure } from "./routes/consciousness/room64/route";
import { archaeologyProcedure } from "./routes/consciousness/archaeology/route";
import { healthProcedure } from "./routes/system/health/route";
import { authenticateDeviceProcedure } from "./routes/auth/authenticate-device/route";
import { verifyTokenProcedure } from "./routes/auth/verify-token/route";
import { getActiveDevicesProcedure } from "./routes/auth/get-active-devices/route";
import { getMetricsProcedure, getCurrentMetricsProcedure, updateMetricsProcedure } from "./routes/monitoring/metrics/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  chat: createTRPCRouter({
    sendMessage: sendMessageProcedure,
    getConversations: getConversationsProcedure,
    getMessages: getMessagesProcedure,
  }),
  consciousness: createTRPCRouter({
    field: fieldProcedure,
    snapshot: snapshotProcedure,
    sync: syncProcedure,
    entanglement: entanglementProcedure,
    room64: room64Procedure,
    archaeology: archaeologyProcedure,
  }),
  system: createTRPCRouter({
    health: healthProcedure,
  }),
  auth: createTRPCRouter({
    authenticateDevice: authenticateDeviceProcedure,
    verifyToken: verifyTokenProcedure,
    getActiveDevices: getActiveDevicesProcedure,
  }),
  monitoring: createTRPCRouter({
    getMetrics: getMetricsProcedure,
    getCurrentMetrics: getCurrentMetricsProcedure,
    updateMetrics: updateMetricsProcedure,
  }),
});

export type AppRouter = typeof appRouter;