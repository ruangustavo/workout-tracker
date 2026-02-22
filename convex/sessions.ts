import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const start = mutation({
	args: { workout: v.id("workouts") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		const workout = await ctx.db.get(args.workout);
		if (!workout) throw new Error("Treino não encontrado");

		const existing = await ctx.db
			.query("sessions")
			.withIndex("by_user_status", (q) =>
				q.eq("userId", userId).eq("status", "in_progress"),
			)
			.first();
		if (existing) throw new Error("Já existe um treino em andamento");

		const sessionId = await ctx.db.insert("sessions", {
			workout: args.workout,
			program: workout.program,
			startedAt: Date.now(),
			status: "in_progress",
			userId,
		});

		for (let i = 0; i < workout.exercises.length; i++) {
			const entry = workout.exercises[i];
			await ctx.db.insert("exerciseLogs", {
				session: sessionId,
				exercise: entry.exercise,
				order: i,
				status: "pending",
				sets: [],
			});
		}

		return sessionId;
	},
});

export const complete = mutation({
	args: { id: v.id("sessions") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Não autenticado");

		const session = await ctx.db.get(args.id);
		if (!session) throw new Error("Sessão não encontrada");

		const logs = await ctx.db
			.query("exerciseLogs")
			.withIndex("by_session", (q) => q.eq("session", args.id))
			.collect();

		for (const log of logs) {
			if (log.status === "pending") {
				await ctx.db.patch(log._id, { status: "skipped" });
			}
		}

		await ctx.db.patch(args.id, {
			status: "completed",
			endedAt: Date.now(),
		});
	},
});

export const getActive = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		const session = await ctx.db
			.query("sessions")
			.withIndex("by_user_status", (q) =>
				q.eq("userId", userId).eq("status", "in_progress"),
			)
			.first();

		if (!session) return null;

		const workout = await ctx.db.get(session.workout);
		const program = await ctx.db.get(session.program);

		return { ...session, workout, program };
	},
});

export const listByRange = query({
	args: { from: v.number(), to: v.number() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_started_at", (q) =>
				q.gte("startedAt", args.from).lt("startedAt", args.to),
			)
			.collect();

		return sessions.filter((s) => s.status === "completed" && s.userId === userId);
	},
});

export const listByMonth = query({
	args: { year: v.number(), month: v.number() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const start = new Date(args.year, args.month, 1).getTime();
		const end = new Date(args.year, args.month + 1, 1).getTime();

		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_started_at", (q) =>
				q.gte("startedAt", start).lt("startedAt", end),
			)
			.collect();

		return sessions.filter((s) => s.status === "completed" && s.userId === userId);
	},
});
