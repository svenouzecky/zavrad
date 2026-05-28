import { supabase } from "@/app/supabase";

export async function GET() {

	const { data, error } = await supabase
	.from("racuni")
	.select("*");

	return Response.json({
		data,
	})
}

export async function POST() {
	const racuni = [
		{'ime': "Hrvatski Telekom", "lokacija": "Trg Petra Kresimira 4, Zagreb", "datum": "1.1.2026."},
		{'ime': "Racun2", "lokacija": "lokacija2", "datum": "2.1.2026."}
	]
	return Response.json({
		racuni,
	})
}
