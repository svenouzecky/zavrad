'use client';

import { useState, useEffect } from "react";
import ListajRacune from './ListajRacune';
import EditDelete from './EditDelete';
import { supabase } from "@/app/supabase";

const SortableTable = () => {

	type Racun = {
	  id: any;
	  user_id: any;
	  cijena: any;
	  platitelj: any;
	  adresa_platitelj : any;
	  primatelj: any;
	  adresa_primatelj: any;
	  iban: any;
	  model: any;
	  poziv_na_broj: any;
	  sifra_namjene: any;
	  opis_placanja: any;
	  created_at: any;
	  rok_placanja: string;
	  kategorija: any;
	  izvanredan: any;	
	}

const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  const [searchKey, setSearchKey] = useState('primatelj');
  const [searchMin, setSearchMin] = useState('');
  const [searchMax, setSearchMax] = useState('');
  const [racuni, setRacuni] = useState<Racun[]>([]);

	useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {            
		const { data: users, error: error1 } = await supabase.from('korisnici').select("id").eq("email", data.user.email);
		if (!users || users.length === 0) return;
        const { data: racuni, error: error2 } = await supabase.from('racuni').select().eq("user_id", users[0].id).order('rok_placanja');
        setRacuni(racuni ?? []);
      }
      
    };
    fetchUser();
  }, [supabase]);

	function formatDate(date) {
	  const [year, month, day] = date.split("-");
	  return `${day}.${month}.${year}.`;
	}

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortArrow = (key) => {
    if (sortKey !== key) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const filtered = racuni.filter((item) => {
    if (searchKey === 'cijena') {
      const val = parseFloat(item.cijena);
      const min = searchMin !== '' ? parseFloat(searchMin) : null;
      const max = searchMax !== '' ? parseFloat(searchMax) : null;
      if (min !== null && val < min) return false;
      if (max !== null && val > max) return false;
      return true;
    }
    return String(item[searchKey] ?? '').toLowerCase().includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (['rok_placanja'].includes(sortKey)) {
      return sortDir === 'asc' ? new Date(valA).getTime() - new Date(valB).getTime() : new Date(valB).getTime() - new Date(valA).getTime();
    }
    if (typeof valA === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    return sortDir === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

    return (
    <>
		<div className="mb-4 flex gap-3">
			<select
				value={searchKey}
				onChange={(e) => { setSearchKey(e.target.value); setSearch(''); }}
				className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-500"
			>
				<option value="primatelj">Primatelj</option>
				<option value="cijena">Iznos</option>
				<option value="adresa_platitelj">Adresa platitelja</option>
				<option value="kategorija">Kategorija</option>
				<option value="rok_placanja">Rok plaćanja</option>
			</select>
			{searchKey === 'cijena' ? (
				<div className="flex gap-2 w-full">
				    <input
				        type="number"
				        value={searchMin}
				        onChange={(e) => setSearchMin(e.target.value)}
				        placeholder="Minimalni iznos"
				        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 outline-none focus:border-blue-500"
				    />
				    <span className="flex items-center text-gray-500">—</span>
				    <input
				        type="number"
				        value={searchMax}
				        onChange={(e) => setSearchMax(e.target.value)}
				        placeholder="Maksimalni iznos"
				        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 outline-none focus:border-blue-500"
				    />
				</div>
			) : (
				<input
				    type="text"
				    value={search}
				    onChange={(e) => setSearch(e.target.value)}
				    placeholder={"Pretraži..."}
				    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 outline-none focus:border-blue-500"
				/>
			)}
		</div>
    
    {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {sorted.map((data) => (
          <div key={data.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium"></span>
              <span className="text-sm font-bold text-gray-700">{data.cijena} €</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">{data.primatelj}</p>
            {data.rok_placanja && (
              <p className="text-xs text-gray-400 mb-3">
                Rok: {formatDate(data.rok_placanja)}
              </p>
            )}
<EditDelete data={data} />
          </div>
        ))}
      </div>
    
    <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th
                        onClick={() => handleSort('rok_placanja')}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100"
                    >
                        Rok plaćanja{sortArrow('rok_placanja')}
                    </th>
                    <th
                        onClick={() => handleSort('kategorija')}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100"
                    >
                        Kategorija{sortArrow('kategorija')}
                    </th>                    
                    <th
                        onClick={() => handleSort('primatelj')}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100"
                    >
                        Primatelj{sortArrow('primatelj')}
                    </th>
                    <th
                        onClick={() => handleSort('cijena')}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100"
                    >
                        Iznos{sortArrow('cijena')}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                        Uredi / Izbriši
                    </th>
                </tr>
            </thead>
            <ListajRacune sortKey={sortKey} sortDir={sortDir} search={search} searchKey={searchKey} searchMin={searchMin} searchMax={searchMax}/>
        </table>
        </div>
        </>
    );
};

export default SortableTable;
