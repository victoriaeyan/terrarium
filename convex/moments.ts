import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("moments")
      .withIndex("by_author", (q) => q.eq("author", userId))
      .order("desc")
      .take(50);
  },
});

export const add = mutation({
  args: { text: v.string(), place: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const text = args.text.trim();
    if (text.length === 0 || text.length > 280) {
      throw new Error("A moment must be 1 to 280 characters");
    }
    return await ctx.db.insert("moments", {
      author: userId,
      text,
      place: args.place?.trim() || undefined,
    });
  },
});
