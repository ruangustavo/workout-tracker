import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const programs = await ctx.db
			.query("programs")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();
		return programs.sort((a, b) => {
			if (a.active && !b.active) return -1;
			if (!a.active && b.active) return 1;
			return a.name.localeCompare(b.name);
		});
	},
});

export const getActive = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		const programs = await ctx.db
			.query("programs")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();
		const program = programs.find((p) => p.active) ?? null;

		if (!program) return null;

		const workouts = await ctx.db
			.query("workouts")
			.withIndex("by_program", (q) => q.eq("program", program._id))
			.collect();

		return { ...program, workouts };
	},
});

export const get = query({
	args: { id: v.id("programs") },
	handler: async (ctx, args) => {
		return ctx.db.get(args.id);
	},
});

export const create = mutation({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		return ctx.db.insert("programs", {
			name: args.name,
			active: false,
			userId,
			schedule: {
				monday: null,
				tuesday: null,
				wednesday: null,
				thursday: null,
				friday: null,
				saturday: null,
				sunday: null,
			},
		});
	},
});

export const update = mutation({
	args: {
		id: v.id("programs"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		await ctx.db.patch(args.id, { name: args.name });
	},
});

export const activate = mutation({
	args: { id: v.id("programs") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		const activePrograms = await ctx.db
			.query("programs")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect()
			.then((p) => p.filter((p) => p.active));

		for (const program of activePrograms) {
			await ctx.db.patch(program._id, { active: false });
		}

		await ctx.db.patch(args.id, { active: true });
	},
});

export const deactivate = mutation({
	args: { id: v.id("programs") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		await ctx.db.patch(args.id, { active: false });
	},
});

export const updateSchedule = mutation({
	args: {
		id: v.id("programs"),
		day: v.string(),
		workoutId: v.union(v.id("workouts"), v.null()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		const program = await ctx.db.get(args.id);
		if (!program) throw new Error("Programa não encontrado");

		await ctx.db.patch(args.id, {
			schedule: {
				...program.schedule,
				[args.day]: args.workoutId,
			},
		});
	},
});

export const remove = mutation({
	args: { id: v.id("programs") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		const workouts = await ctx.db
			.query("workouts")
			.withIndex("by_program", (q) => q.eq("program", args.id))
			.collect();

		for (const workout of workouts) {
			await ctx.db.delete(workout._id);
		}

		await ctx.db.delete(args.id);
	},
});
