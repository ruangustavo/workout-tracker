import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
	args: {
		muscleGroup: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		if (args.muscleGroup) {
			const exercises = await ctx.db
				.query("exercises")
				.withIndex("by_muscle_group", (q) =>
					q.eq("muscleGroup", args.muscleGroup!),
				)
				.collect();
			return exercises.filter((e) => e.isPreset || e.userId === userId);
		}

		const exercises = await ctx.db.query("exercises").collect();
		return exercises.filter((e) => e.isPreset || e.userId === userId);
	},
});

export const get = query({
	args: { id: v.id("exercises") },
	handler: async (ctx, args) => {
		return ctx.db.get(args.id);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		muscleGroup: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		return ctx.db.insert("exercises", {
			name: args.name,
			muscleGroup: args.muscleGroup,
			isPreset: false,
			userId,
		});
	},
});

export const remove = mutation({
	args: { id: v.id("exercises") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		const exercise = await ctx.db.get(args.id);
		if (!exercise) throw new Error("Exercício não encontrado");
		if (exercise.isPreset) throw new Error("Exercícios padrão não podem ser removidos");

		const workoutsUsingExercise = await ctx.db.query("workouts").collect();
		const isUsed = workoutsUsingExercise.some((w) =>
			w.exercises.some((e) => e.exercise === args.id),
		);
		if (isUsed) {
			throw new Error("Este exercício está sendo usado em um treino");
		}

		await ctx.db.delete(args.id);
	},
});
