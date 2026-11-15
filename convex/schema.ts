import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const villagerFields = {
  name: v.string(),
  vibe: v.string(),
  palette: v.number(),
  house: v.union(
    v.literal("cottage"),
    v.literal("treehouse"),
    v.literal("loft"),
    v.literal("dome"),
  ),
  pet: v.union(
    v.literal("cat"),
    v.literal("dog"),
    v.literal("frog"),
    v.literal("none"),
  ),
};

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
  }),
  moments: defineTable({
    author: v.id("users"),
    text: v.string(),
    place: v.optional(v.string()),
  }).index("by_author", ["author"]),
  villagers: defineTable(villagerFields),
});
