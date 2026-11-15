import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { villagerFields } from "./schema";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("villagers").order("desc").take(50);
  },
});

export const add = mutation({
  args: villagerFields,
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (name.length === 0 || name.length > 24) {
      throw new Error("Name must be 1 to 24 characters");
    }
    return await ctx.db.insert("villagers", {
      ...args,
      name,
      vibe: args.vibe.trim().slice(0, 60),
    });
  },
});
