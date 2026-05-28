'use client'

import RedirButton from '../RedirButton'

export default function Admin() {
	
	const clearCache = async () => {
		if('caches' in window) {
			await caches.delete("static-cache-v1");
			alert("Ociscen cache.");
		}	
	}
	
	return (
		<div className="flex min-h-screen items-center justify-center font-sans dark:bg-transparent py-10 px-16">
		  <main className="flex min-h-screen w-full flex-col items-center justify-between py-10 px-16 bg-white sm:items-start rounded-lg">
			<div className="flex w-full flex-col items-center justify-between bg-transparent">
			  <h3 className="text-white dark:text-black">Računi</h3>
			</div>
			<div className="flex min-h-screen w-full flex-col items-center py-32 px-16 bg-white rounded-lg">
				<button className="rounded-lg m-6 px-15 bg-blue-500" onClick={clearCache}>Ocisti cache</button>
				<RedirButton url="/" ime="Povratak na glavnu stranicu" />
			  {/* <img src="./icon-512x512.png" alt="Racuni logo" /> */}
			</div>
		  </main>
		</div>
	
			
	)
}
