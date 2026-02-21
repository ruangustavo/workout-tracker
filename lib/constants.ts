export const MUSCLE_GROUPS = [
	"Peito",
	"Costas",
	"Ombros",
	"Bíceps",
	"Tríceps",
	"Antebraço",
	"Quadríceps",
	"Posterior",
	"Glúteos",
	"Panturrilha",
	"Abdômen",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const DAYS_OF_WEEK = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const DAY_LABELS: Record<DayOfWeek, string> = {
	monday: "Segunda",
	tuesday: "Terça",
	wednesday: "Quarta",
	thursday: "Quinta",
	friday: "Sexta",
	saturday: "Sábado",
	sunday: "Domingo",
};

export const DAY_LABELS_SHORT: Record<DayOfWeek, string> = {
	monday: "Seg",
	tuesday: "Ter",
	wednesday: "Qua",
	thursday: "Qui",
	friday: "Sex",
	saturday: "Sáb",
	sunday: "Dom",
};
