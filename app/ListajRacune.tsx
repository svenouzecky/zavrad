"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/supabase";
import EditDelete from './EditDelete';

export default function ListajRacune({ sortKey, sortDir, search, searchKey, searchMin, searchMax }) {
	
	const [racuni, setRacuni] = useState([]);
	const [user, setUser] = useState(null);
	
	
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
	
	const isNearDeadline = (deadline) => {
		if (!deadline) return false;
		const today = new Date();
		const deadlineDate = new Date(deadline);
		const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
		return diffDays <= 7 && diffDays >= 0;
	};
	
	useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);             
		const { data: users, error: error1 } = await supabase.from('korisnici').select("id").eq("email", data.user.email);
        const { data: racuni, error: error2 } = await supabase.from('racuni').select().eq("user_id", users[0].id).order('rok_placanja');
        setRacuni(racuni);
      }
      
    };
    fetchUser();
  }, [supabase]);
  
  
  	const sorted = [...filtered].sort((a, b) => {
        if (!sortKey) return 0;
        const valA = a[sortKey];
        const valB = b[sortKey];
        
        if (['rok_placanja'].includes(sortKey)) {
        return sortDir === 'asc'
            ? new Date(valA) - new Date(valB)
            : new Date(valB) - new Date(valA);
    	}
        
        if (typeof valA === 'number') {
            return sortDir === 'asc' ? valA - valB : valB - valA;
        }
        return sortDir === 'asc'
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
    });
  /*
  
  */

			return (
            <tbody className="divide-y divide-gray-100 bg-white">
              {sorted.map((data) => (
                <tr
                  key={data.id}
                  className="transition hover:bg-blue-50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {data.rok_placanja ?? '-'}
                    {isNearDeadline(data.rok_placanja) && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                    ⚠️
                </span>
            )}
                  </td>
					<td className="px-6 py-4 text-sm text-gray-600">
                    {data.kategorija ?? '-'}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {data.primatelj}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {data.cijena.toFixed(2)}
                  </td>
<td className="px-6 py-4">
  <div className="flex items-center justify-center gap-3">

    <EditDelete data={data} />

  </div>
</td>                  
                  
                </tr>
              ))}
            </tbody>
            )
}
