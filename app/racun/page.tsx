"use client"
import Image from "next/image";
import { useRef, useState, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/supabase";

export default function Home() {
	const router = useRouter();
	const videoRef = useRef(null);
  	const canvasRef = useRef(null);
  	const hints = new Map();
  	const searchParams = useSearchParams();
  	
	const getEndOfMonth = () => {
		const date = new Date();
		const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		const year = endOfMonth.getFullYear();
		const month = String(endOfMonth.getMonth() + 1).padStart(2, '0');
		const day = String(endOfMonth.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};
	
	const handleInfoOpen = () => {
		setEditedSuccess({ ...success });
		setIsInfoOpen(true);
		setIsEditing(false);
	};
  	
  	const handleInfoSave = async () => {
		//console.log(editedSuccess);
		setSuccess(editedSuccess);
		setIsInfoOpen(false);
        setSuccessOpen(true);
	};

  	const lookupTable = {
		cijena: 'Cijena',
		primatelj: 'Primatelj',
		platitelj: 'Platitelj',
		adresa_platitelj: 'Adresa platitelja',
		iban: 'IBAN',
		adresa_primatelj: 'Adresa primatelja',
		model: 'Model',
		poziv_na_broj: 'Poziv na broj',
		sifra_namjene: 'Šifra namjene',
		opis_placanja: 'Opis plaćanja',
		rok_placanja: 'Rok plaćanja',
		kategorija: 'Kategorija',
	};
  	
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
  	
  	hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.PDF_417]);
  	hints.set(DecodeHintType.TRY_HARDER, true);
  	
  	const codeReader = new BrowserMultiFormatReader(hints);
  	var resultVideo;
  	var idUs = "";
  	const [isEditing, setIsEditing] = useState(false);
	const [editedSuccess, setEditedSuccess] = useState({});
  	const [isInfoOpen, setIsInfoOpen] = useState(false);
  	const [izvanredan, setIzvanRedan] = useState(false);
  	const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
	const [deadlineDate, setDeadlineDate] = useState(getEndOfMonth());
  	const [user, setUser] = useState(null);
  	const [success, setSuccess] = useState({});
  	const [stream, setStream] = useState(null);
  	const [camError, setCamError] = useState(false);
  	
	
	useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        const { data: users, error: error1 } = await supabase.from('korisnici').select("id").eq("email", data.user.email);
        data.user.id = users[0].id;
        idUs = users[0].id;
        setUser(data.user);
        
      }
    };
    fetchUser();
  }, [supabase, router]);
	
	useEffect(() => {
		pocniSnimanje()
	}, []);

	const pocniSnimanje = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: {facingMode: "environment"} });
			videoRef.current.srcObject = stream;
			videoRef.current.style.display = 'block';
			//videoRef.current.play();
			//console.log(videoRef.current);
			codeReader.decodeFromVideoElement(videoRef.current, async (result, err) => {
				if(result) {
					//console.log("Uspjesno uhvaceno: " + result);
					result = result.toString();
					let index;
					var lines = result.split("\n");
					var map = {};
					for(var i = 0; i < lines[2].length; i++) {
						if(lines[2][i] != "0") {
							index = i;
							break;
						}
					}
					map.user_id = idUs;
					map.cijena = parseInt(lines[2].substring(index)) / 100;
					map.platitelj = lines[3];
					map.adresa_platitelj = lines[4] + ", " + lines[5];
					map.primatelj = lines[6];
					map.adresa_primatelj = lines[7] + ", " + lines[8];
					map.iban = lines[9];
					map.model = lines[10];
					map.poziv_na_broj = lines[11];
					map.sifra_namjene = lines[12];
					map.opis_placanja = lines[13];
					map.kategorija = grupe[lines[12]] ?? 'Ostalo';
					map.rok_placanja = deadlineDate;
					
					setSuccess(map);
				}
				//if(err){
					//console.log("Greska! " + err.name);
					//console.error(err);
				//}
				//console.log(e)
			});				
		} catch (err) {
			console.error("Error accessing webcam:", err);
			setCamError(true);
		}
	};
	
	const sendData = async () => {	
		const successNew = {
		  ...success,
		  "izvanredan": +izvanredan
		};
		const { data, error } = await supabase
		.from("racuni")
		.insert(successNew);
		alert("Uspjesno poslano!");
		try {
			if(error.message !== null){
				alert(error.message);
			}
		}
		catch (error) {
			console.log(error);
		}
	}
	
	
	return (
		<div className="flex min-h-dvh items-center justify-center font-sans dark:bg-transparent py-10 px-4">
		  <main className="flex w-[95%] sm:w-[90%] lg:w-[80%] flex-col items-center justify-between py-10 px-4 sm:px-16 bg-white sm:items-start rounded-lg">
			<div className="flex w-full flex-col items-center justify-between bg-transparent">
			  <h3 className="text-white dark:text-black">Računi</h3>
			</div>
			<div id="dyn" className="flex min-h-screen w-full flex-col items-center py-32 px-16 bg-white rounded-lg">
				
			{isInfoOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
					<div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
						<div className="mb-5 flex items-center justify-between">
						    <h2 className="text-2xl font-semibold text-gray-800">
						        Detalji računa
						    </h2>
						    <button
						        onClick={() => setIsInfoOpen(false)}
						        className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
						    >
						        ✕
						    </button>
						</div>
						<div className="space-y-3">
						    {Object.entries(editedSuccess)
						        .filter(([key]) => key !== 'user_id')
						        .map(([key, value]) => (
						            <div key={key} className="flex justify-between border-b border-gray-100 pb-2">
						                <span className="text-sm font-medium text-gray-500">{lookupTable[key] ?? key}</span>
						                {isEditing ? (
						                    key === 'kategorija' ? (             	
						                        <select
						                            value={editedSuccess[key] ?? 'Ostalo'}
						                            onChange={(e) => setEditedSuccess({ ...editedSuccess, [key]: e.target.value })}
						                            className="text-sm text-gray-800 border border-gray-300 rounded px-2 py-0.5 outline-none focus:border-blue-500"
						                        >
						                            {Object.entries(grupe).map(([code, label]) => (
						                                <option key={code} value={code}>{label}</option>
						                            ))}
						                            <option value="">Ostalo</option>
						                        </select>
						                    ) : key === 'rok_placanja' ? (
												<input
													type="date"
													value={editedSuccess[key] ?? ''}
													onChange={(e) => setEditedSuccess({ ...editedSuccess, [key]: e.target.value })}
													className="text-sm text-gray-800 border border-gray-300 rounded px-2 py-0.5 outline-none focus:border-blue-500"
												/>
											) : (
						                        <input
						                            type="text"
						                            value={editedSuccess[key] ?? ''}
						                            onChange={(e) => setEditedSuccess({ ...editedSuccess, [key]: e.target.value })}
						                            className="text-sm text-gray-800 border border-gray-300 rounded px-2 py-0.5 outline-none focus:border-blue-500 text-right"
						                        />
						                    )
						                ) : (
						                    <span className="text-sm text-gray-800">
						                        {key === 'kategorija' ? (value ?? 'Ostalo') : value}
						                    </span>
						                )}
						            </div>
						        ))}
						</div>
						<div className="mt-6 flex justify-between">
						    <button
						        onClick={() => setIsEditing(!isEditing)}
						        className="rounded-lg border border-blue-300 px-4 py-2 text-blue-600 hover:bg-blue-50"
						    >
						        {isEditing ? 'Odustani' : 'Uredi'}
						    </button>
						    <div className="flex gap-3">
						        <button
						            onClick={() => setIsInfoOpen(false)}
						            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
						        >
						            Zatvori
						        </button>
						        {isEditing && (
						            <button
						                onClick={handleInfoSave}
						                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
						            >
						                Spremi
						            </button>
						        )}
						    </div>
						</div>
					</div>
				</div>
			)}
				
				{isDeadlineOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
						<div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
							<div className="mb-5 flex items-center justify-between">
								<h2 className="text-2xl font-semibold text-gray-800">
								    Rok plaćanja
								</h2>
								<p>{JSON.stringify(success)}</p>
								<button
								    onClick={() => setIsDeadlineOpen(false)}
								    className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
								>
								    ✕
								</button>
							</div>
							<div>
								<label className="mb-1 block text-sm font-medium text-gray-700">
								    Datum roka plaćanja
								</label>
								<input
								    type="date"
								    value={deadlineDate}
								    onChange={(e) => setDeadlineDate(e.target.value)}
								    className="w-full rounded-lg border text-gray-500 border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
								/>
							</div>
							<div className="mt-6 flex justify-end gap-3">
								<button
								    onClick={() => setIsDeadlineOpen(false)}
								    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
								>
								    Odustani
								</button>
								<button
								    onClick={() => {success.rok_placanja = deadlineDate; setSuccess(success); setIsDeadlineOpen(false)}}
								    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
								>
								    Spremi
								</button>
							</div>
						</div>
					</div>
				)}
				
				{camError && 
					<p className="text-white dark:text-black">Kamera nedostupna.</p>
				}
				<video ref={videoRef} id="webcam" style={{
		            display: 'block',
		            width: '100%',
		            height: 'auto',
		            position: 'relative',
		            zIndex: 5,
		          }} autoPlay></video>
				<canvas ref={canvasRef} style={{
		            position: 'relative',
		            zIndex: 10,
		            pointerEvents: 'none',
		            width: '100%',
		            height: 'auto',
              	}}></canvas>
              	{(Object.keys(success).length > 0) && (
              		<>
		          		{/* <img src="./icon-512x512.png" alt="Racuni logo" /> <img src={photoData} /> */}
		          		<div className="w-full overflow-x-auto">
		          		<table className=" w-full text-white text-center dark:text-black bg-blue-200 border border-separate rounded-lg">
							<thead>
								<tr className="border bg-lime-200">
									<td className="border">Primatelj</td>
									<td className="border">IBAN</td>
									<td className="border">Cijena</td>
									<td className="border"></td>									
								</tr>
							</thead>
							<tbody>
								<tr key={success.id} className="bg-neutral border-b border-default hover:bg-blue-300">
									<td className="border">{success.primatelj}</td>
									<td className="border">{success.iban}</td>
									<td className="border">{success.cijena}</td>
									<td className="border">
										<button onClick={handleInfoOpen} className="flex items-center justify-center w-full">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="w-5 h-5 text-blue-600 hover:text-blue-800"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={2}
											>
												<circle cx="12" cy="12" r="10" />
												<line x1="12" y1="8" x2="12" y2="8" strokeLinecap="round" />
												<line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
											</svg>
										</button>
									</td>									
								</tr>
							</tbody>				
						</table>
						</div>
		          		<button id="posaljiRacun" onClick={sendData} className="rounded-lg m-6 px-15 bg-blue-500">Pošalji račun</button>
		          		
		          		<p className="mt-3 text-sm text-gray-500 text-center">
							Prvo zadajte rok plaćanja (neobavezno, ukoliko ga ne zadate, postavlja se na kraj mjeseca), a zatim pošaljite račun.
						</p>
		          		
		          		<button
								onClick={() => setIsDeadlineOpen(true)}
								className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							>
								Dodaj rok plaćanja
						</button>
						
						<label className="flex mt-3 items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 cursor-pointer transition">
						  <input
							type="checkbox"
							defaultChecked={izvanredan}
							onChange={(e) => setIzvanRedan(e.target.checked)}
							className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400"
						  />

						  <span className="text-sm font-medium text-gray-700">
							Ovo nije mjesečni trošak
						  </span>
						</label>
              		</>
              	)}
			  {/* <img src="./icon-512x512.png" alt="Racuni logo" /> */}
			</div>
		  </main>
		</div>
	);
}
