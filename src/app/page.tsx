"use client";

import { Button } from "@/components/ui/button";

export default function HomePage(){

  const handleLogin = () => {
    window.location.href = "https://localhost:7089/auth/login"
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold">Portfolio Generator</h1>
        <p className="text-lg text-gray-400">Automatically generate a portfolio from your GitHub profile</p>
        <Button variant="secondary" size="lg" className="mt-4" onClick={handleLogin}>
          Login With GitHub
        </Button>
      </div>
    </main>
  );
}