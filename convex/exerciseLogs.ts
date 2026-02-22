import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getBySession = query({
	args: { session: v.id("sessions") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const logs = await ctx.db
			.query("exerciseLogs")
			.withIndex("by_session", (q) => q.eq("session", args.session))
			.collect();

		const logsWithDetails = await Promise.all(
			logs.map(async (log) => {
				const exercise = await ctx.db.get(log.exercise);
				return { ...log, exerciseDetails: exercise };
			}),
		);

		return logsWithDetails.sort((a, b) => a.order - b.order);
	},
});

export const updateSets = mutation({
	args: {
		id: v.id("exerciseLogs"),
		sets: v.array(
			v.object({
				number: v.number(),
				weight: v.number(),
				reps: v.number(),
			}),
		),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		await ctx.db.patch(args.id, {
			sets: args.sets,
			status: "completed",
		});
	},
});

export const skip = mutation({
	args: { id: v.id("exerciseLogs") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		await ctx.db.patch(args.id, { status: "skipped" });
	},
});

export const getHistory = query({
	args: { exercise: v.id("exercises") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const logs = await ctx.db
			.query("exerciseLogs")
			.withIndex("by_exercise", (q) => q.eq("exercise", args.exercise))
			.collect();

		const completedLogs = logs.filter((l) => l.status === "completed");

		const logsWithSession = await Promise.all(
			completedLogs.map(async (log) => {
				const session = await ctx.db.get(log.session);
				if (!session || session.userId !== userId) return null;
				const workout = await ctx.db.get(session.workout);
				return {
					...log,
					startedAt: session.startedAt,
					workoutName: workout?.name ?? "",
				};
			}),
		);

		const filtered = logsWithSession.filter(
			(l): l is NonNullable<typeof l> => l !== null,
		);

		return filtered
			.sort((a, b) => b.startedAt - a.startedAt)
			.slice(0, 10);
	},
});

export const getProgressData = query({
	args: { exercise: v.id("exercises") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const logs = await ctx.db
			.query("exerciseLogs")
			.withIndex("by_exercise", (q) => q.eq("exercise", args.exercise))
			.collect();

		const completedLogs = logs.filter((l) => l.status === "completed");

		const logsWithSession = await Promise.all(
			completedLogs.map(async (log) => {
				const session = await ctx.db.get(log.session);
				if (!session || session.userId !== userId) return null;
				const volume = log.sets.reduce(
					(sum, set) => sum + set.weight * set.reps,
					0,
				);
				return {
					date: session.startedAt,
					volume,
					maxWeight: Math.max(...log.sets.map((s) => s.weight), 0),
				};
			}),
		);

		return logsWithSession
			.filter((l): l is NonNullable<typeof l> => l !== null)
			.sort((a, b) => a.date - b.date);
	},
});

export const getPreviousWeight = query({
	args: { exercise: v.id("exercises") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		const logs = await ctx.db
			.query("exerciseLogs")
			.withIndex("by_exercise", (q) => q.eq("exercise", args.exercise))
			.collect();

		const completedLogs = logs.filter((l) => l.status === "completed");

		if (completedLogs.length === 0) return null;

		const logsWithSession = await Promise.all(
			completedLogs.map(async (log) => {
				const session = await ctx.db.get(log.session);
				if (!session || session.userId !== userId) return null;
				return { ...log, startedAt: session.startedAt };
			}),
		);

		const filtered = logsWithSession.filter(
			(l): l is NonNullable<typeof l> => l !== null,
		);

		if (filtered.length === 0) return null;

		const latest = filtered.sort(
			(a, b) => b.startedAt - a.startedAt,
		)[0];

		return latest.sets;
	},
});
