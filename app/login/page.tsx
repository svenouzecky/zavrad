"use client";

import { useState } from "react";
import { supabase } from "@/app/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    let res;
    if (isSignUp) {
    console.log("user: " + username);
      res = await supabase.auth.signUp({
       'email': email,
       'password': password,
       options: {
       	data: {
       		'username': username,
       	}
       }
    }   	
);
    } else {
      res = await supabase.auth.signInWithPassword({ email, password });
    }

    if (res.error) {
      setErrorMsg(res.error.message);
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-lightblue p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl text-white dark:text-black font-bold mb-6 text-center">{isSignUp ? "Sign Up" : "Login"}</h2>

        {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}
		{isSignUp &&
		
		 <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-3 border bg-blue-100 text-white dark:text-black rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
		 }
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border bg-blue-100 text-white dark:text-black rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border bg-blue-100 text-white dark:text-black rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="text-blue-600 underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Login" : "Sign Up"}
          </button>
        </p>
      </form>
    </div>
  );
}
