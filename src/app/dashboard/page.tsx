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

  const handleSave = async () => {
    if (!user) return;

    const selectedRepositories = repos.filter(repo => repo.selected);

    const resumeData = {
      email: user.email,
      linkedIn: user.linkedIn,
      professionalSummary: user.summary,
      contactInfo: '', // You can expand this later
      selectedRepositories: selectedRepositories.map(repo => ({
        repoId: repo.id,
        name: repo.name,
        description: repo.description,
        customDescription: repo.description, // Default to original description
        language: repo.language,
        starCount: repo.starCount,
        url: repo.url,
        customTitle: repo.name, // Default to original name
        customBulletPoints: [], // Will implement in next milestone
      })),
    };

    try {
      const response = await fetch("https://localhost:7089/api/user/resume", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save resume data: ${errorText}`);
      }

      alert("Portfolio saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while saving.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-10">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-10">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Your Dashboard</h1>
      
      {user && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <img 
            src={user.avatarUrl} 
            alt="User avatar" 
            className="w-24 h-24 rounded-full mb-4 border border-gray-600" 
          />
          <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
          <p className="text-gray-400">@{user.login}</p>
          <p className="mt-4 text-gray-300">{user.bio}</p>
        </div>
      )}

      <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-white mb-4">Contact Information & Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Email"
            value={user?.email || ""}
            onChange={(e) => setUser(user ? { ...user, email: e.target.value } : null)}
            className="bg-gray-700 text-white border-gray-600"
          />
          <Input
            placeholder="LinkedIn Profile URL"
            value={user?.linkedIn || ""}
            onChange={(e) => setUser(user ? { ...user, linkedIn: e.target.value } : null)}
            className="bg-gray-700 text-white border-gray-600"
          />
        </div>
        <Textarea
          placeholder="Professional Summary"
          value={user?.summary || ""}
          onChange={(e) => setUser(user ? { ...user, summary: e.target.value } : null)}
          className="mt-4 bg-gray-700 text-white border-gray-600 min-h-[120px]"
        />
      </div>

      <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-white mb-2">Select Repositories</h2>
        <p className="text-gray-400 mb-4">Click on a repository card to select or deselect it for your portfolio.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className={`border p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                repo.selected 
                  ? "border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/10" 
                  : "border-gray-700 bg-gray-750 hover:border-gray-500"
              }`}
              onClick={() => handleSelectRepo(repo.id)}
            >
              <h3 className="font-semibold text-white truncate">{repo.name}</h3>
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">{repo.description}</p>
              <div className="flex items-center justify-between mt-4 text-xs">
                <span className="text-gray-500">{repo.language || 'N/A'}</span>
                <span className="text-gray-500 flex items-center gap-1">
                  <span>⭐</span>
                  <span>{repo.starCount}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          size="lg" 
          className="px-8 py-3 text-lg"
          onClick={handleSave}
        >
          Save Portfolio
        </Button>
      </div>
    </main>
  );
}