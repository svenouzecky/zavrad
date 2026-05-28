"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
        setUsername(data.user.user_metadata.username);
        setEmail(data.user.email);
      }
    };
    fetchUser();
  }, [supabase, router]);

  const handleUpdate = async () => {
    const { data, error } = await supabase.auth.updateUser({
		'email': email,
       	data: {
       		username,
       	}
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Values updated!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl text-white dark:text-black font-bold mb-6">Settings</h2>

        <label className="text-white dark:text-black block mb-2 font-semibold">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="text-white dark:text-black w-full p-3 border rounded mb-4"
        />
        
        <label className="text-white dark:text-black block mb-2 font-semibold">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-white dark:text-black w-full p-3 border rounded mb-4"
        />

        <button
          onClick={handleUpdate}
          className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
        >
          Update
        </button>

        <button
          onClick={handleLogout}
          className="w-full p-3 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
