import Image from "next/image";
import RedirButton from '@/app/RedirButton';
import Link from "next/link";
import UserSide from './UserSide';
import ListajRacune from './ListajRacune';
import SortableTable from './SortableTable';
import MobileMenu from './MobileMenu';

export default async function Home() {

	const delay = async (ms) => {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		})
	}
	
	//var racuni = await fetch("http://localhost:3000/api/racuni");
	//racuni = await racuni.json();
	//racuni = racuni["data"];
	
	return (
<div className="min-h-dvh bg-gray-100 font-sans">

  {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
		<div className="flex items-center gap-3">
        	{/*<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md">
       	   		R
        	</div>*/}
        <div>
          <h1 className="text-lg font-bold text-gray-800">
            Računi
          </h1>
          <p className="text-xs text-gray-500">
            
          </p>
        </div>
      </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            href="/analytics"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            Analytics
          </Link>

          <Link
            href="/settings"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            Settings
          </Link>
        </div>
		<MobileMenu />
        {/* Right side */}
			<UserSide />
      </div>
    </nav>
	
  {/* Main */}
  <main className="mx-auto mt-10 w-full max-w-6xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">

    {/* Header */}
    <div className="border-b border-gray-200 px-6 py-5 sm:px-10">
      <h1 className="text-2xl font-bold text-gray-800">
        Pregled računa
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        
      </p>
    </div>

    {/* Content */}
    <div className="p-6 sm:p-10">
	
      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">

          <SortableTable />
        </div>
      </div>

      {/* Button */}
      <div className="mt-8 flex justify-end">
        <RedirButton
          url="/racun"
          ime="Pošalji račun"
        />
      </div>
    </div>
  </main>
</div>
);
}
