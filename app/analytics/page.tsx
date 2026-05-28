'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useRouter } from "next/navigation";

import { supabase } from "@/app/supabase";
import type { User } from "@supabase/supabase-js";

	type Racun = {
	  id: any;
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


	const grupe = {
		CBTV: 'Kabelska televizija',
		ELEC: 'Struja',
		ENRG: 'Energija',
		GASB: 'Plin',
		NWCH: 'Mreza (telekom)',
		NWCM: 'Mreza (telekom)',
		OTLC: 'Telekomunikacije (internet)',
		PHON: 'Telefon',
		WTER: 'Voda',
	};

	const keyLabels = {
	  id: 'ID', primatelj: 'Primatelj', iban: 'IBAN', cijena: 'Iznos',
	  rok_placanja: 'Rok plaćanja', kategorija: 'Kategorija', adresa_platitelj: 'Adresa platitelja',
	  platitelj: 'Platitelj', adresa_primatelj: 'Adresa primatelja', model: 'Model', poziv_na_broj: 'Poziv na broj',
	  sifra_namjene: 'Šifra namjene', opis_placanja: 'Opis plaćanja',
	};

function InfoModal({ racun, onClose }) {
  if (!racun) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Detalji računa</h2>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100">✕</button>
        </div>
        <div className="space-y-3">
          {Object.entries(racun)
          	.filter(([key]) => key !== 'id' && key !== 'created_at' && key !== 'izvanredan')        
            .map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm font-medium text-gray-500">{keyLabels[key] ?? key}</span>
                <span className="text-sm text-gray-800">
                  {key === 'kategorija' ? (grupe[value as string] ?? 'Ostalo') : (value ?? '-')}
                </span>
              </div>
            ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100">
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {

	const MONTH_NAMES = ['Sij', 'Velj', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'];

	const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6'];

	const isNearDeadline = (deadline) => {
	  if (!deadline) return false;
	  const today = new Date();
	  const d = new Date(deadline);
	  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
	  return diff >= 0 && diff <= 7;
	};

	const isOverdue = (deadline) => {
	  if (!deadline) return false;
	  return new Date(deadline) < new Date();
	};

	const exportToCSV = (racuni) => {
	  const headers = ['Primatelj', 'IBAN', 'Iznos', 'Kategorija', 'Rok plaćanja', 'Adresa platitelja'];
	  const rows = racuni.map((r) => [
		r.primatelj ?? '',
		r.iban ?? '',
		r.cijena ?? '',
		grupe[r.kategorija] ?? r.kategorija ?? '',
		r.rok_placanja ?? '',
		r.adresa_platitelj ?? '',
	  ]);
	  const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
	  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	  const url = URL.createObjectURL(blob);
	  const a = document.createElement('a');
	  a.href = url;
	  a.download = 'racuni.csv';
	  a.click();
	  URL.revokeObjectURL(url);
	};

	const router = useRouter();
  const [racuni, setRacuni] = useState<Racun[]>([]);
  const [chartMode, setChartMode] = useState('all');
const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [infoRacun, setInfoRacun] = useState<Racun | null>(null);
  const [izvanredniFilter, setIzvanredniFilter] = useState('all');
  const [activeSection, setActiveSection] = useState('rokovi7');

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        const { data: users } = await supabase.from('korisnici').select('id').eq('email', data.user.email);
        if (!users || users.length === 0) return;
        const { data: racuniData } = await supabase.from('racuni').select('id,cijena,platitelj,adresa_platitelj,primatelj,adresa_primatelj,iban,model,poziv_na_broj,sifra_namjene,opis_placanja,created_at,rok_placanja,kategorija,izvanredan').eq('user_id', users[0].id).order('rok_placanja');
        setRacuni(racuniData ?? []);
      }
      else {
      	router.push("/login");
      }
      setLoading(false);
    };
    fetchUser();
  }, [supabase]);

  // Monthly totals
  const monthlyTotals = racuni.reduce((acc, r) => {
  	var month = 0;
    if (!r.rok_placanja) {
    	month = new Date(r.created_at).getMonth();
    }
    else {
    month = new Date(r.rok_placanja).getMonth();
    }
    acc[month] = (acc[month] ?? 0) + parseFloat(r.cijena ?? 0);
    return acc;
  }, {});
  const monthData = MONTH_NAMES.map((name, i) => ({ name, total: parseFloat((monthlyTotals[i] ?? 0).toFixed(2)) }));

	const filledMonths = monthData.filter((m) => m.total > 0);
	const avgMonthly = filledMonths.length > 0
	  ? filledMonths.reduce((sum, m) => sum + m.total, 0) / filledMonths.length
	  : 0;
	  
	const monthlyWithout = racuni.reduce((acc, r) => {
  	var month = 0;
    if (!r.rok_placanja) {
    	month = new Date(r.created_at).getMonth();
    }
    else {
    month = new Date(r.rok_placanja).getMonth();
    }
        if(r.izvanredan == "1") {
    	return acc;
    }
    
    acc[month] = (acc[month] ?? 0) + parseFloat(r.cijena ?? 0);
    return acc;


      }, {});
      
        const monthDataW = MONTH_NAMES.map((name, i) => ({ name, total: parseFloat((monthlyWithout[i] ?? 0).toFixed(2)) }));

	const filledMonthsW = monthDataW.filter((m) => m.total > 0);
	const avgMonthlyW = filledMonthsW.length > 0
	  ? filledMonthsW.reduce((sum, m) => sum + m.total, 0) / filledMonthsW.length
	  : 0;
      
	const nextMonthPrediction = avgMonthlyW;
	
	
	const monthlyTotalsIzvanredan = racuni.filter(r => r.izvanredan == "1").reduce((acc, r) => {
	  if (!r.rok_placanja) return acc;
	  const month = new Date(r.rok_placanja).getMonth();
	  acc[month] = (acc[month] ?? 0) + parseFloat(r.cijena ?? 0);
	  return acc;
	}, {});
	
	const monthDataIzvanredan = MONTH_NAMES.map((name, i) => ({ name, total: parseFloat((monthlyTotalsIzvanredan[i] ?? 0).toFixed(2)) }));

	const activeMonthData = chartMode === 'all' ? monthData : chartMode === 'izvanredan' ? monthDataIzvanredan : monthDataW;
	const activeMonthlyTotals = chartMode === 'all' ? monthlyTotals : chartMode === 'izvanredan' ? monthlyTotalsIzvanredan : monthlyWithout;

  // By category
  const categoryData = Object.entries(
    racuni.reduce((acc, r) => {
      var key = r.kategorija ?? 'Ostalo';
      if(r.izvanredan == "1") {
      	key = "Izvanredni";
      }
      acc[key] = (acc[key] ?? 0) + parseFloat(r.cijena ?? 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: parseFloat((value as number).toFixed(2)) }));

  // By adresa_platitelja
  const adresaData = Object.entries(
    racuni.reduce((acc, r) => {
      const key = r.adresa_platitelj ?? 'Nepoznato';
      acc[key] = (acc[key] ?? 0) + parseFloat(r.cijena ?? 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: parseFloat((value as number).toFixed(2)) }));

  const totalSum = racuni.reduce((sum, r) => sum + parseFloat(r.cijena ?? 0), 0);
  const upcoming = racuni.filter((r) => isNearDeadline(r.rok_placanja));
  const overdue = racuni.filter((r) => isOverdue(r.rok_placanja));

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-100 font-sans flex items-center justify-center">
        <div className="text-gray-400 text-sm tracking-widest uppercase animate-pulse">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-100 font-sans">
      <main className="mx-auto mt-10 w-full max-w-6xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        <div className="p-6 sm:p-10">

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => exportToCSV(racuni)}
                className="rounded-xl bg-gray-800 border border-gray-700 px-4 py-2 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Izvoz u CSV
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">Rok u idućih 7 dana</p>
              <p className="text-3xl font-bold text-amber-500">{upcoming.length}</p>

            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">Ovaj mjesec</p>
              <p className="text-3xl font-bold text-blue-500">
                {(monthlyTotals[new Date().getMonth()] ?? 0).toFixed(2)} EUR
              </p>
              
            </div>
          </div>

		<div className="mb-8 rounded-xl border border-purple-100 bg-purple-50 p-6">
  <h2 className="text-sm font-semibold text-purple-500 uppercase tracking-wider mb-4">
    Predviđanje troškova
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="rounded-xl bg-white border border-purple-100 p-4">
      <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">Prosjek po mjesecima</p>
      <p className="text-2xl font-bold text-purple-600">{avgMonthly.toFixed(2)} EUR</p>
    </div>

    <div className="rounded-xl bg-white border border-purple-100 p-4">
      <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">Predviđeni iznos sljedećeg mjeseca</p>
      <p className="text-2xl font-bold text-purple-600">{nextMonthPrediction.toFixed(2)} EUR</p>
    </div>
  </div>
</div>

          {/* Monthly bar chart */}
          <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Iznos po mjesecima</h2>
    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium w-fit">
      <button
        onClick={() => setChartMode('all')}
        className={`px-3 py-1.5 transition-colors ${chartMode === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
      >
        Svi
      </button>
      <button
        onClick={() => setChartMode('redovni')}
        className={`px-3 py-1.5 border-l border-gray-200 transition-colors ${chartMode === 'redovni' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
      >
        Redovni
      </button>
      <button
        onClick={() => setChartMode('izvanredan')}
        className={`px-3 py-1.5 border-l border-gray-200 transition-colors ${chartMode === 'izvanredan' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
      >
        Izvanredni
      </button>
    </div>
  </div>
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={activeMonthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `${v}€`} />
      <Tooltip formatter={(v) => [`${v.toFixed(2)} €`, 'Iznos']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }} />
      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
        {activeMonthData.map((_, i) => (
          <Cell
            key={i}
            fill={
              i === new Date().getMonth()
                ? chartMode === 'izvanredan' ? '#ef4444' : chartMode === 'redovni' ? '#10b981' : '#3b82f6'
                : chartMode === 'izvanredan' ? '#fecaca' : chartMode === 'redovni' ? '#bbf7d0' : '#bfdbfe'
            }
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>

          {/* Pie charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Po kategoriji</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v.toFixed(2)} EUR`]} contentStyle={{ borderRadius: '8px', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Po adresi platitelja</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={adresaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {adresaData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v.toFixed(2)} EUR`]} contentStyle={{ borderRadius: '8px', fontSize: 12 }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
		<div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium mb-6 w-fit">
		  <button
			onClick={() => setActiveSection('rokovi7')}
			className={`px-4 py-2 transition-colors ${activeSection === 'rokovi7' ? 'bg-amber-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
		  >
			Rokovi u 7 dana
		  </button>
		  <button
			onClick={() => setActiveSection('izvanredni')}
			className={`px-4 py-2 border-l border-gray-200 transition-colors ${activeSection === 'izvanredni' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
		  >
			Izvanredni troškovi
		  </button>
		
		</div>
		{activeSection === 'rokovi7' && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-6">
            <h2 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-4">
              ⚠️ Rokovi u sljedećih 7 dana
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-amber-300">Nema nadolazećih rokova.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((r) => {
                  const daysLeft = Math.ceil((new Date(r.rok_placanja).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={r.id} className="flex items-center justify-between rounded-lg bg-white border border-amber-100 px-4 py-3 shadow-sm">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-700">{r.primatelj}</p>
                        <p className="text-xs text-gray-400">
                          {grupe[r.kategorija] ?? 'Ostalo'} · Adresa: {r.adresa_platitelj}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-700">{parseFloat(r.cijena).toFixed(2)} EUR</p>
                          <p className="text-xs font-medium text-gray-700">
                            {`${r.rok_placanja}`}
                          </p>
                        </div>
                        <button
                          onClick={() => setInfoRacun(r)}
                          className="flex items-center justify-center text-blue-400 hover:text-blue-600 transition-colors"
                          title="Detalji"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="8" strokeLinecap="round" />
                            <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
		)}
		
		{activeSection === 'izvanredni' && (
  <div className="rounded-xl border border-red-100 bg-red-50 p-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider">
        🔴 Izvanredni troškovi
      </h2>
      <div className="flex rounded-lg border border-red-200 overflow-hidden text-xs font-medium w-fit">
        <button
          onClick={() => setIzvanredniFilter('all')}
          className={`px-3 py-1.5 transition-colors ${izvanredniFilter === 'all' ? 'bg-red-500 text-white' : 'bg-white text-red-400 hover:bg-red-50'}`}
        >
          Svi
        </button>
        <button
          onClick={() => setIzvanredniFilter('month')}
          className={`px-3 py-1.5 border-l border-red-200 transition-colors ${izvanredniFilter === 'month' ? 'bg-red-500 text-white' : 'bg-white text-red-400 hover:bg-red-50'}`}
        >
          Ovaj mjesec
        </button>
      </div>
    </div>
    {(() => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const filtered = racuni.filter(r => r.izvanredan == "1").filter(r => {
        if (izvanredniFilter === 'month') {
          if (!r.rok_placanja) return false;
          const d = new Date(r.created_at);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }
        return true;
      });

      return filtered.length === 0 ? (
        <p className="text-sm text-red-300">Nema izvanrednih troškova.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg bg-white border border-red-100 px-4 py-3 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-700">{r.primatelj}</p>
                <p className="text-xs text-gray-400">
                  {grupe[r.kategorija] ?? 'Ostalo'} · Adresa: {r.adresa_platitelj}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">{parseFloat(r.cijena).toFixed(2)} €</p>
                  <p className="text-xs text-gray-400">{r.rok_placanja ?? '-'}</p>
                </div>
                <button
                  onClick={() => setInfoRacun(r)}
                  className="flex items-center justify-center text-blue-400 hover:text-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="8" strokeLinecap="round" />
                    <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    })()}
  </div>
)}
        </div>
      </main>

      <InfoModal racun={infoRacun} onClose={() => setInfoRacun(null)} />
    </div>
  );
}
