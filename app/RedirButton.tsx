'use client'
import { useRouter } from "next/navigation";

export default function RedirButton({url, ime}) {
	const router = useRouter()
	
	const handleClick = () => {
		router.push(`${url}`)
	}
	
	return (
		<button onClick={handleClick} className="rounded-lg m-6 px-15 bg-blue-500">{ime}</button>
	)
}
