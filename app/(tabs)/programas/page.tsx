import { ProgramForm } from "@/components/program-form";
import { ProgramsList } from "./programs-list";

export default function ProgramasPage() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold tracking-tight">Programas</h1>
				<ProgramForm />
			</div>
			<ProgramsList />
		</div>
	);
}
