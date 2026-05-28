"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/supabase";
import type { User } from "@supabase/supabase-js";

export default function EditDelete({data}) {
	const [user, setUser] = useState<User | null>(null);
	const [primatelj, setPrimatelj] = useState("");
	const [iban, setIban] = useState("");
	const [iznos, setIznos] = useState("");
	var [rokPlacanja, setRokPlacanja] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [isErrorOpen, setIsErrorOpen] = useState(false);
	const [isSuccessOpen, setSuccessOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [idRacuna, setIdRacuna] = useState(0);
	const [deleteId, setDeleteId] = useState(0);
  const handleEdit = async (id) => {
  	if(user) {
	  	setIsOpen(true);
	  	setIdRacuna(id);
	  	const { data, error } = await supabase.from('racuni').select().eq('id', id);
	  	if (data) {
	  		setPrimatelj(data[0].primatelj);
	  		setIban(data[0].iban);
	  		setIznos(data[0].cijena);
	  		setRokPlacanja(data[0].rok_placanja);
	  	}
    }
    else {
    	console.log("nedovoljne ovlasti!");
    }
  };
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
      }
      
    };
    fetchUser();
  }, [supabase]);

	const handleDelete = async () => {
		if(user) {
		  const { error } = await supabase.from('racuni').delete().eq('id', deleteId);
		  if (error) {
			setIsDeleteOpen(false);
			setIsErrorOpen(true);
		  } else {
			setIsDeleteOpen(false);
			setSuccessOpen(true);
		  }
	  }
	  else {
	  	console.log("nedovoljne ovlasti!");
	  }
	};
  
   const handleSave = async () => {
   	rokPlacanja = rokPlacanja !== '' ? rokPlacanja : null;
    console.log("Primatelj: " + primatelj + "\nIBAN: " + iban + "\nIznos: " + iznos + "\nDatum: " + rokPlacanja);
    const { error } = await supabase.from('racuni').update({'primatelj': primatelj, 'iban': iban, 'cijena': iznos, 'rok_placanja': rokPlacanja,}).eq('id', idRacuna);
    if(error) {
    	setIsOpen(false);
    	setIsErrorOpen(true);
    }
    else {
    setIsOpen(false);
    	setSuccessOpen(true);
    }
  };

	return (	
	<>
	
	{isDeleteOpen && (
	  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
		<div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
		  <div className="mb-5 flex items-center justify-between">
		    <h2 className="text-2xl font-semibold text-gray-800">
		      Obriši račun
		    </h2>
		    <button
		      onClick={() => setIsDeleteOpen(false)}
		      className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
		    >
		      ✕
		    </button>
		  </div>
		  <p className="text-gray-600">
		    Jeste li sigurni da želite obrisati ovaj račun?
		  </p>
		  <div className="mt-6 flex justify-end gap-3">
		    <button
		      onClick={() => setIsDeleteOpen(false)}
		      className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
		    >
		      Odustani
		    </button>
		    <button
		      onClick={() => handleDelete()}
		      className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
		    >
		      Obriši
		    </button>
		  </div>
		</div>
	  </div>
	)}
	
	{isOpen && (
	
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
          {/* Solid Modal */}
          <div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">
                Uredi račun
              </h2>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
            
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Rok plaćanja
                </label>

                <input
                  type="date"
                  value={rokPlacanja?? ''}
                  onChange={(e) => setRokPlacanja(e.target.value)}
                  placeholder="Rok plaćanja"
                  className="w-full rounded-lg border text-gray-500 border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>
            
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Primatelj
                </label>

                <input
                  type="text"
                  value={primatelj?? ''}
                  onChange={(e) => setPrimatelj(e.target.value)}
                  placeholder="Primatelj"
                  className="w-full rounded-lg border text-gray-500 border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  IBAN
                </label>

                <input
                  type="text"
                  value={iban?? ''}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="IBAN"
                  className="w-full rounded-lg border text-gray-500 border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Iznos
                </label>

                <input
                  type="number"
                  value={parseFloat(iznos).toFixed(2)?? ''}
                  onChange={(e) => setIznos(e.target.value)}
                  placeholder="Iznos računa"
                  className="w-full rounded-lg border text-gray-500 border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
              	onClick={() => handleSave()}
               className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
               >
                Save
              </button>
            </div>
          </div>
        </div>
	
	)}
	
	{isErrorOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          {/* Transparent Modal */}
          <div className="w-[400px] rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-3">
              Greska...
            </h2>

            <p className="text-white/80">
              Dogodila se greska.
            </p>

            <button
              onClick={() => setIsErrorOpen(false)}
              className="mt-5 rounded-lg bg-white/20 px-4 py-2 hover:bg-white/30"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
	{isSuccessOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          {/* Transparent Modal */}
          <div className="w-[400px] rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-3">
              Uspjeh
            </h2>

            <p className="text-white/80">
              Uspješno ažurirano.
            </p>

            <button
              onClick={() => setSuccessOpen(false)}
              className="mt-5 rounded-lg bg-white/20 px-4 py-2 hover:bg-white/30"
            >
              Close
            </button>
          </div>
        </div>
      )}      
	
    <button
	  onClick={() => handleEdit(data.id)}
      className="text-blue-600 hover:text-blue-800 transition"
      title="Edit"
    >
    
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.862 3.487a2.1 2.1 0 0 1 2.97 2.97L8.5 17.789 4 19l1.211-4.5 11.651-11.013z"
        />
      </svg>
    </button>

    
    <button
      onClick={() => { setIsOpen(false); setDeleteId(data.id); setIsDeleteOpen(true); }}
      className="text-red-600 hover:text-red-800 transition"
      title="Delete"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 7h12M9 7V5h6v2m-8 0l1 14h8l1-14"
        />
      </svg>
    </button>
 </>
);
}
