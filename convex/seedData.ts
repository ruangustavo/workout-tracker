import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";

const PRESET_EXERCISES: { name: string; muscleGroup: string }[] = [
	// Peito
	{ name: "Supino Reto", muscleGroup: "Peito" },
	{ name: "Supino Inclinado", muscleGroup: "Peito" },
	{ name: "Supino Declinado", muscleGroup: "Peito" },
	{ name: "Crucifixo", muscleGroup: "Peito" },
	{ name: "Crossover", muscleGroup: "Peito" },
	{ name: "Flexão de Braço", muscleGroup: "Peito" },
	// Costas
	{ name: "Puxada Frontal", muscleGroup: "Costas" },
	{ name: "Puxada Aberta", muscleGroup: "Costas" },
	{ name: "Remada Curvada", muscleGroup: "Costas" },
	{ name: "Remada Unilateral", muscleGroup: "Costas" },
	{ name: "Remada Sentada", muscleGroup: "Costas" },
	{ name: "Reverse Lat Pulldown", muscleGroup: "Costas" },
	{ name: "Pullover", muscleGroup: "Costas" },
	{ name: "Remada Baixa", muscleGroup: "Costas" },
	{ name: "Barra Fixa", muscleGroup: "Costas" },
	// Ombros
	{ name: "Desenvolvimento Militar", muscleGroup: "Ombros" },
	{ name: "Elevação Lateral", muscleGroup: "Ombros" },
	{ name: "Elevação Lateral Inclinada", muscleGroup: "Ombros" },
	{ name: "Elevação Frontal", muscleGroup: "Ombros" },
	{ name: "Crucifixo Inverso", muscleGroup: "Ombros" },
	{ name: "Encolhimento", muscleGroup: "Ombros" },
	// Bíceps
	{ name: "Rosca Direta", muscleGroup: "Bíceps" },
	{ name: "Rosca Alternada", muscleGroup: "Bíceps" },
	{ name: "Rosca Martelo", muscleGroup: "Bíceps" },
	{ name: "Rosca Concentrada", muscleGroup: "Bíceps" },
	{ name: "Rosca Scott", muscleGroup: "Bíceps" },
	// Tríceps
	{ name: "Tríceps Pulley", muscleGroup: "Tríceps" },
	{ name: "Tríceps Testa", muscleGroup: "Tríceps" },
	{ name: "Tríceps Francês", muscleGroup: "Tríceps" },
	{ name: "Extensão de Tríceps Overhead", muscleGroup: "Tríceps" },
	{ name: "Mergulho", muscleGroup: "Tríceps" },
	{ name: "Tríceps Corda", muscleGroup: "Tríceps" },
	// Quadríceps
	{ name: "Agachamento Livre", muscleGroup: "Quadríceps" },
	{ name: "Leg Press", muscleGroup: "Quadríceps" },
	{ name: "Cadeira Extensora", muscleGroup: "Quadríceps" },
	{ name: "Agachamento Búlgaro", muscleGroup: "Quadríceps" },
	{ name: "Hack Squat", muscleGroup: "Quadríceps" },
	{ name: "Avanço", muscleGroup: "Quadríceps" },
	// Posterior
	{ name: "Stiff", muscleGroup: "Posterior" },
	{ name: "Levantamento Terra", muscleGroup: "Posterior" },
	{ name: "Mesa Flexora", muscleGroup: "Posterior" },
	{ name: "Cadeira Flexora", muscleGroup: "Posterior" },
	{ name: "Levantamento Terra Romeno", muscleGroup: "Posterior" },
	// Glúteos
	{ name: "Hip Thrust", muscleGroup: "Glúteos" },
	{ name: "Elevação Pélvica", muscleGroup: "Glúteos" },
	{ name: "Abdução de Quadril", muscleGroup: "Glúteos" },
	// Panturrilha
	{ name: "Panturrilha em Pé", muscleGroup: "Panturrilha" },
	{ name: "Panturrilha Sentado", muscleGroup: "Panturrilha" },
	// Abdômen
	{ name: "Abdominal Crunch", muscleGroup: "Abdômen" },
	{ name: "Prancha", muscleGroup: "Abdômen" },
	{ name: "Elevação de Pernas", muscleGroup: "Abdômen" },
	{ name: "Russian Twist", muscleGroup: "Abdômen" },
];

export const run = internalMutation({
	args: {
		email: v.string(),
		name: v.string(),
		hashedPassword: v.string(),
	},
	handler: async (ctx, args) => {
		let userId: Id<"users">;
		const existingUser = await ctx.db
			.query("users")
			.filter((q) => q.eq(q.field("email"), args.email))
			.first();

		if (existingUser) {
			userId = existingUser._id;
		} else {
			userId = await ctx.db.insert("users", {
				email: args.email,
				name: args.name,
			});
		}

		const existingPasswordAccount = await ctx.db
			.query("authAccounts")
			.withIndex("providerAndAccountId", (q) =>
				q.eq("provider", "password").eq("providerAccountId", args.email),
			)
			.first();

		if (existingPasswordAccount) {
			await ctx.db.patch(existingPasswordAccount._id, {
				userId,
				secret: args.hashedPassword,
			});
		} else {
			await ctx.db.insert("authAccounts", {
				userId,
				provider: "password",
				providerAccountId: args.email,
				secret: args.hashedPassword,
			});
		}

		const existingExercises = await ctx.db.query("exercises").collect();
		const existingNames = new Set(existingExercises.map((e) => e.name));

		for (const exercise of PRESET_EXERCISES) {
			if (!existingNames.has(exercise.name)) {
				await ctx.db.insert("exercises", {
					...exercise,
					isPreset: true,
				});
			}
		}

		const existingProgram = await ctx.db
			.query("programs")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.filter((q) => q.eq(q.field("name"), "Upper/Lower"))
			.first();

		if (existingProgram) {
			return { seeded: false, message: "Already seeded" };
		}

		const allExercises = await ctx.db.query("exercises").collect();
		const byName = (name: string): Id<"exercises"> => {
			const ex = allExercises.find((e) => e.name === name);
			if (!ex) throw new Error(`Exercício não encontrado: ${name}`);
			return ex._id;
		};

		const otherPrograms = await ctx.db
			.query("programs")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();
		for (const p of otherPrograms) {
			if (p.active) {
				await ctx.db.patch(p._id, { active: false });
			}
		}

		const programId = await ctx.db.insert("programs", {
			name: "Upper/Lower",
			active: true,
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

		const upperAId = await ctx.db.insert("workouts", {
			name: "Upper A",
			program: programId,
			exercises: [
				{
					exercise: byName("Supino Reto"),
					sets: 3,
					repsMin: 5,
					repsMax: 8,
					restMin: 180,
					restMax: 180,
				},
				{
					exercise: byName("Remada Curvada"),
					sets: 3,
					repsMin: 6,
					repsMax: 8,
					restMin: 180,
					restMax: 180,
				},
				{
					exercise: byName("Desenvolvimento Militar"),
					sets: 3,
					repsMin: 8,
					repsMax: 10,
					restMin: 120,
					restMax: 120,
				},
				{
					exercise: byName("Puxada Aberta"),
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 120,
					restMax: 120,
				},
				{
					exercise: byName("Elevação Lateral"),
					sets: 3,
					repsMin: 10,
					repsMax: 15,
					restMin: 90,
					restMax: 120,
				},
				{
					exercise: byName("Rosca Direta"),
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 90,
					restMax: 120,
				},
				{
					exercise: byName("Extensão de Tríceps Overhead"),
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 90,
					restMax: 120,
				},
			],
		});

		const lowerAId = await ctx.db.insert("workouts", {
			name: "Lower A",
			program: programId,
			exercises: [
				{
					exercise: byName("Agachamento Livre"),
					sets: 3,
					repsMin: 5,
					repsMax: 8,
					restMin: 180,
					restMax: 180,
				},
				{
					exercise: byName("Cadeira Extensora"),
					sets: 3,
					repsMin: 10,
					repsMax: 15,
					restMin: 90,
					restMax: 120,
				},
				{
					exercise: byName("Stiff"),
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 120,
					restMax: 120,
				},
				{
					exercise: byName("Leg Press"),
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 120,
					restMax: 120,
				},
				{
					exercise: byName("Panturrilha em Pé"),
					sets: 3,
					repsMin: 10,
					repsMax: 15,
					restMin: 90,
					restMax: 120,
				},
			],
		});

		// === Upper B ===
		const upperBId = await ctx.db.insert("workouts", {
			name: "Upper B",
			program: programId,
			exercises: [
				{
					exercise: byName("Remada Sentada"),
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 120,
					restMax: 120,
				},
				{
					exercise: byName("Supino Inclinado"),
					sets: 3,
					repsMin: 6,
					repsMax: 10,
					restMin: 120,
					restMax: 120,
				},
				{
					exercise: byName("Reverse Lat Pulldown"),
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 120,
					restMax: 120,
				},
				{
					exercise: byName("Elevação Lateral Inclinada"),
					sets: 3,
					repsMin: 10,
					repsMax: 15,
					restMin: 90,
					restMax: 120,
				},
				{
					exercise: byName("Rosca Martelo"),
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 90,
					restMax: 120,
				},
				{
					exercise: byName("Tríceps Testa"),
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 90,
					restMax: 120,
				},
			],
		});

		const lowerBId = await ctx.db.insert("workouts", {
			name: "Lower B",
			program: programId,
			exercises: [
				{
					exercise: byName("Levantamento Terra"),
					sets: 3,
					repsMin: 5,
					repsMax: 8,
					restMin: 180,
					restMax: 180,
				},
				{
					exercise: byName("Avanço"),
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 120,
					restMax: 120,
				},
				{
					exercise: byName("Hip Thrust"),
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 120,
					restMax: 120,
				},
				{
					exercise: byName("Mesa Flexora"),
					sets: 3,
					repsMin: 10,
					repsMax: 15,
					restMin: 90,
					restMax: 120,
				},
				{
					exercise: byName("Panturrilha Sentado"),
					sets: 3,
					repsMin: 10,
					repsMax: 15,
					restMin: 90,
					restMax: 120,
				},
			],
		});

		await ctx.db.patch(programId, {
			schedule: {
				monday: upperAId,
				tuesday: lowerAId,
				wednesday: null,
				thursday: upperBId,
				friday: lowerBId,
				saturday: null,
				sunday: null,
			},
		});

		return { seeded: true };
	},
});
