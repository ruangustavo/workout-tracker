"use node";

import { v } from "convex/values";
import { Scrypt } from "lucia";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

export const seed = action({
	args: {
		email: v.optional(v.string()),
		password: v.optional(v.string()),
		name: v.optional(v.string()),
	},
	handler: async (
		ctx,
		args,
	): Promise<{ seeded: boolean; message?: string }> => {
		const email = args.email ?? "ruangustavo123@gmail.com";
		const password = args.password ?? "123qwe123";
		const name = args.name ?? "Ruan";

		const hashedPassword = await new Scrypt().hash(password);

		return await ctx.runMutation(internal.seedData.run, {
			email,
			name,
			hashedPassword,
		});
	},
});
