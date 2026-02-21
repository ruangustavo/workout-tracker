import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	...authTables,

	exercises: defineTable({
		name: v.string(),
		muscleGroup: v.string(),
		isPreset: v.boolean(),
		userId: v.optional(v.id("users")),
	})
		.index("by_muscle_group", ["muscleGroup"])
		.index("by_name", ["name"])
		.index("by_user", ["userId"]),

	programs: defineTable({
		name: v.string(),
		active: v.boolean(),
		schedule: v.record(v.string(), v.union(v.id("workouts"), v.null())),
		userId: v.id("users"),
	})
		.index("by_active", ["active"])
		.index("by_user", ["userId"]),

	workouts: defineTable({
		name: v.string(),
		program: v.id("programs"),
		exercises: v.array(
			v.object({
				exercise: v.id("exercises"),
				sets: v.number(),
				repsMin: v.number(),
				repsMax: v.number(),
				restMin: v.number(),
				restMax: v.number(),
			}),
		),
	}).index("by_program", ["program"]),

	sessions: defineTable({
		workout: v.id("workouts"),
		program: v.id("programs"),
		startedAt: v.number(),
		endedAt: v.optional(v.number()),
		status: v.union(v.literal("in_progress"), v.literal("completed")),
		userId: v.id("users"),
	})
		.index("by_workout", ["workout"])
		.index("by_status", ["status"])
		.index("by_started_at", ["startedAt"])
		.index("by_user_status", ["userId", "status"]),

	exerciseLogs: defineTable({
		session: v.id("sessions"),
		exercise: v.id("exercises"),
		order: v.number(),
		status: v.union(
			v.literal("pending"),
			v.literal("completed"),
			v.literal("skipped"),
		),
		sets: v.array(
			v.object({
				number: v.number(),
				weight: v.number(),
				reps: v.number(),
			}),
		),
	})
		.index("by_session", ["session"])
		.index("by_exercise", ["exercise"]),
});
