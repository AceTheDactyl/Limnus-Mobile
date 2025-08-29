import { createTRPCRouter } from "./create-context";
import { default as hiRoute } from "./routes/example/hi/route";
import { sendMessageProcedure } from "./routes/chat/send-message/route";
import { getConversationsProcedure } from "./routes/chat/get-conversations/route";
import { getMessagesProcedure } from "./routes/chat/get-messages/route";
import { fieldProcedure } from "./routes/consciousness/field/route";
import { syncProcedure } from "./routes/consciousness/sync/route";
import { entanglementProcedure } from "./routes/consciousness/entanglement/route";
import { room64Procedure } from "./routes/consciousness/room64/route";
import { archaeologyProcedure } from "./routes/consciousness/archaeology/route";
import { healthProcedure } from "./routes/system/health/route";

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
    sync: syncProcedure,
    entanglement: entanglementProcedure,
    room64: room64Procedure,
    archaeology: archaeologyProcedure,
  }),
  system: createTRPCRouter({
    health: healthProcedure,
  }),
});

export type AppRouter = typeof appRouter;