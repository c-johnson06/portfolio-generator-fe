"use client";

import { useState, useEffect } from "react";

type User = {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("https://localhost:7089/api/me", {
            credentials: "include",
        });

        if (!response.ok) {
          throw new Error("You are not authenticated.");
        }
        
        const data: User = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
      {user && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <img src={user.avatarUrl} alt="User avatar" className="w-24 h-24 rounded-full mb-4" />
          <h2 className="text-2xl font-semibold">{user.name}</h2>
          <p className="text-gray-400">@{user.login}</p>
          <p className="mt-4">{user.bio}</p>
        </div>
      )}
    </main>
  );
}