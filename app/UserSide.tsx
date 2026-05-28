"use client";
import Link from "next/link";

import { supabase } from "@/app/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";  

export default function UserSide() {
	const router = useRouter();
	const [user, setUser] = useState(null);
	
	const handleLogout = async () => {
    	await supabase.auth.signOut();
    	router.push("/login");
	}
	
	useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        setUser(data.user);
      }
      
    };
    fetchUser();
  }, [supabase]);

		return (
        <div className="flex items-center gap-4">

          {!user ? (
            <>
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                Login / Sign up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">

              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  {user.user_metadata.username}
                </p>

                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {user.user_metadata.username?.charAt(0) || "U"}
              </div>
			<button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-blue-200 text-white dark:text-black rounded hover:bg-blue-400"
    >
      Logout
    </button>
            </div>
          )}

        </div>
        );
}
