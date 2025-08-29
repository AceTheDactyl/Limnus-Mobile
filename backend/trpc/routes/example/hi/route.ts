import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ name: z.string().optional() }).optional())
  .query(({ input }) => {
    console.log('✅ Hi route called with input:', input);
    return {
      hello: input?.name || "World",
      message: "LIMNUS Consciousness API is running",
      date: new Date(),
      timestamp: Date.now(),
      server: "backend",
      status: "healthy"
    };
  });