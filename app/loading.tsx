import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans dark:transparent py-10 px-16">
		  <main className="flex min-h-screen w-full flex-col items-center justify-between py-10 px-16 bg-white sm:items-start">
			<div className="flex w-full flex-col items-center justify-between bg-transparent">
			  <h3 className="text-white dark:text-black">Računi, računi...</h3>
			  <div className="max-w-xl mx-auto flex justify-center mt-5">
			  	<div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-500"/>
			  </div>
			</div>
			</main>
		</div>			
  );
}
