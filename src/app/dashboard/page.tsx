"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type User = {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  email: string;
  linkedIn: string;
  summary: string;
};

type Repo = {
  id: string;
  name: string;
  description: string;
  language: string;
  starCount: number;
  url: string;
  selected?: boolean;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch("https://localhost:7089/api/user/me", {
          credentials: "include",
        });
        if (!userResponse.ok) {
          throw new Error("You are not authenticated.");
        }
        const userData: User = await userResponse.json();
        setUser(userData);

        const reposResponse = await fetch("https://localhost:7089/api/user/repos", {
          credentials: "include",
        });
        if (!reposResponse.ok) {
          throw new Error("Failed to fetch repositories.");
        }
        const reposData: Repo[] = await reposResponse.json();
        setRepos(reposData.map(repo => ({ ...repo, selected: false })));

      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSelectRepo = (id: string) => {
    setRepos(
      repos.map(repo =>
        repo.id === id ? { ...repo, selected: !repo.selected } : repo
      )
    );
  };

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

      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Contact Information & Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            placeholder="Email"
            value={user?.email || ""}
            onChange={(e) => setUser(user ? { ...user, email: e.target.value } : null)}
          />
          <Input
            placeholder="LinkedIn Profile URL"
            value={user?.linkedIn || ""}
            onChange={(e) => setUser(user ? { ...user, linkedIn: e.target.value } : null)}
          />
        </div>
        <Textarea
          placeholder="Professional Summary"
          value={user?.summary || ""}
          onChange={(e) => setUser(user ? { ...user, summary: e.target.value } : null)}
          className="mt-4"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Select Repositories</h2>
        <p className="text-gray-400">Click on a repository card to select or deselect it for your portfolio.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className={`border p-4 rounded-lg cursor-pointer transition-colors ${
                repo.selected ? "border-primary bg-primary/10" : "border-gray-700 hover:border-gray-500"
              }`}
              onClick={() => handleSelectRepo(repo.id)}
            >
              <h3 className="font-semibold">{repo.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{repo.description}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>{repo.language}</span>
                <span>⭐ {repo.starCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button size="lg" className="mt-8">
        Save Portfolio
      </Button>
    </main>
  );
}