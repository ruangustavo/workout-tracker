import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByProgram = query({
	args: { program: v.id("programs") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const workouts = await ctx.db
			.query("workouts")
			.withIndex("by_program", (q) => q.eq("program", args.program))
			.collect();

		return Promise.all(
			workouts.map(async (workout) => {
				const exercisesWithNames = await Promise.all(
					workout.exercises.map(async (entry) => {
						const exercise = await ctx.db.get(entry.exercise);
						return {
							...entry,
							exerciseName: exercise?.name ?? "Exercício removido",
						};
					}),
				);
				return { ...workout, exercises: exercisesWithNames };
			}),
		);
	},
});

export const get = query({
	args: { id: v.id("workouts") },
	handler: async (ctx, args) => {
		const workout = await ctx.db.get(args.id);
		if (!workout) return null;

		const exercisesWithDetails = await Promise.all(
			workout.exercises.map(async (entry) => {
				const exercise = await ctx.db.get(entry.exercise);
				return {
					...entry,
					exerciseDetails: exercise,
				};
			}),
		);

		return {
			...workout,
			exercises: exercisesWithDetails,
		};
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		program: v.id("programs"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		return ctx.db.insert("workouts", {
			name: args.name,
			program: args.program,
			exercises: [],
		});
	},
});

export const update = mutation({
	args: {
		id: v.id("workouts"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		await ctx.db.patch(args.id, { name: args.name });
	},
});

const workoutExerciseValidator = v.object({
	exercise: v.id("exercises"),
	sets: v.number(),
	repsMin: v.number(),
	repsMax: v.number(),
	restMin: v.number(),
	restMax: v.number(),
});

export const updateExercises = mutation({
	args: {
		id: v.id("workouts"),
		exercises: v.array(workoutExerciseValidator),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		await ctx.db.patch(args.id, { exercises: args.exercises });
	},
});

export const remove = mutation({
	args: { id: v.id("workouts") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		const workout = await ctx.db.get(args.id);
		if (!workout) throw new Error("Treino não encontrado");

		const program = await ctx.db.get(workout.program);
		if (program) {
			const updatedSchedule = { ...program.schedule };
			for (const [day, workoutId] of Object.entries(updatedSchedule)) {
				if (workoutId === args.id) {
					updatedSchedule[day] = null;
				}
			}
			await ctx.db.patch(program._id, { schedule: updatedSchedule });
		}

		await ctx.db.delete(args.id);
	},
});
