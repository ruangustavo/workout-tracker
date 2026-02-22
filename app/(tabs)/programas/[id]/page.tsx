import type { Id } from "@/convex/_generated/dataModel";
import { ProgramDetailClient } from "./program-detail-client";

export default async function ProgramDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return <ProgramDetailClient programId={id as Id<"programs">} />;
}
