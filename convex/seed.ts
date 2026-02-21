import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation } from "./_generated/server";

export const seed = mutation({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		return await ctx.runMutation(internal.seedData.run, {
			userId: args.userId,
		});
	},
});
