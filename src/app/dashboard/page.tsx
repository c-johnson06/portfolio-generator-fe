"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { X, Sparkles } from "lucide-react";

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
  customTitle?: string;
  customBulletPoints?: string[];
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRepo, setEditingRepo] = useState<Repo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel for performance
        const [userRes, reposRes, resumeRes] = await Promise.all([
          fetch("https://localhost:7089/api/user/me", { credentials: "include" }),
          fetch("https://localhost:7089/api/user/repos", { credentials: "include" }),
          fetch("https://localhost:7089/api/user/resume", { credentials: "include" }),
        ]);

        if (!userRes.ok) throw new Error("Authentication failed. Please log in again.");
        if (!reposRes.ok) throw new Error("Failed to fetch repositories.");

        const userData: User = await userRes.json();
        const reposData: Repo[] = await reposRes.json();
        
        // Start with the full list of repos from GitHub
        let initializedRepos = reposData.map(repo => ({ 
          ...repo, 
          selected: false,
          customTitle: repo.name,
          customBulletPoints: []
        }));
        
        // If the user has saved data before, apply their customizations
        if (resumeRes.ok) {
          const resumeData = await resumeRes.json();
          const savedRepos = resumeData.selectedRepositories;
          
          initializedRepos = reposData.map(repo => {
            const savedRepo = savedRepos.find((sr: any) => sr.repoId === repo.id);
            return {
              ...repo,
              selected: !!savedRepo,
              customTitle: savedRepo?.customTitle || repo.name,
              customBulletPoints: savedRepo?.customBulletPoints || []
            };
          });
          
          // Update user info with saved details
          setUser({
            ...userData,
            email: resumeData.user.email,
            linkedIn: resumeData.user.linkedIn,
            summary: resumeData.user.professionalSummary
          });
        } else {
          setUser(userData);
        }
        
        setRepos(initializedRepos);

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
      contactInfo: "", // Not used currently, but in the DTO
      selectedRepositories: selectedRepositories.map(repo => ({
        repoId: repo.id,
        name: repo.name,
        description: repo.description,
        customDescription: "", // Not used currently
        language: repo.language,
        starCount: repo.starCount,
        url: repo.url,
        customTitle: repo.customTitle || repo.name,
        customBulletPoints: repo.customBulletPoints || [],
      })),
    };

    try {
      const response = await fetch("https://localhost:7089/api/user/resume", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save portfolio: ${errorText}`);
      }
      alert("Portfolio saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while saving.");
    }
  };

  const handleDownloadPdf = () => {
    if (!user) return;
    window.open(`https://localhost:7089/api/pdf/resume/${user.login}/pdf`, '_blank');
  };
  
  const handleOpenEditDialog = (repo: Repo) => {
    setEditingRepo({ ...repo }); // Create a copy to avoid mutating state directly
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (!editingRepo) return;
    setRepos(repos.map(r => r.id === editingRepo.id ? editingRepo : r));
    setIsEditDialogOpen(false);
    setEditingRepo(null);
  };

  const handleBulletPointChange = (index: number, value: string) => {
    if (!editingRepo) return;
    const newBulletPoints = [...(editingRepo.customBulletPoints || [])];
    newBulletPoints[index] = value;
    setEditingRepo({ ...editingRepo, customBulletPoints: newBulletPoints });
  };
  
  const addBulletPoint = () => {
    if (!editingRepo) return;
    const newBulletPoints = [...(editingRepo.customBulletPoints || []), ""];
    setEditingRepo({ ...editingRepo, customBulletPoints: newBulletPoints });
  };
  
  const removeBulletPoint = (index: number) => {
    if (!editingRepo || !editingRepo.customBulletPoints) return;
    setEditingRepo({
        ...editingRepo,
        customBulletPoints: editingRepo.customBulletPoints.filter((_, i) => i !== index),
    });
  };

  const handleGenerateBullets = async () => {
    if (!editingRepo || !user) return;
    setIsGenerating(true);
    try {
      const response = await fetch("https://localhost:7089/api/ai/generate-bullets", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: user.login,
          repoName: editingRepo.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate bullet points.");
      }

      const data = await response.json();
      if (data.bulletPoints && Array.isArray(data.bulletPoints)) {
        setEditingRepo({
          ...editingRepo,
          customBulletPoints: data.bulletPoints,
        });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Dashboard...</div>
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
    <>
      <main className="min-h-screen bg-gray-900 container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Your Dashboard</h1>
        
        {user && (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <img 
              src={user.avatarUrl} 
              alt="User avatar" 
              className="w-24 h-24 rounded-full mb-4 border-2 border-gray-600" 
            />
            <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
            <p className="text-gray-400">@{user.login}</p>
            <p className="mt-4 text-gray-300">{user.bio}</p>
          </div>
        )}

        <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Contact & Summary</h2>
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
            placeholder="Write a brief professional summary..."
            value={user?.summary || ""}
            onChange={(e) => setUser(user ? { ...user, summary: e.target.value } : null)}
            className="mt-4 bg-gray-700 text-white border-gray-600 min-h-[120px]"
          />
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-2">Select & Edit Repositories</h2>
          <p className="text-gray-400 mb-4">Click a card to select it for your portfolio.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <Card
                key={repo.id}
                className={`relative cursor-pointer transition-all duration-300 flex flex-col ${
                  repo.selected 
                    ? "border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-500/10" 
                    : "border-gray-700 bg-gray-700/50 hover:border-gray-500"
                }`}
                onClick={() => handleSelectRepo(repo.id)}
              >
                <CardHeader className="flex-grow pb-4">
                  <CardTitle className="text-lg font-bold text-white truncate">
                    {repo.customTitle || repo.name}
                  </CardTitle>
                  <p className="text-sm text-gray-400 pt-2 h-16 overflow-hidden">
                    {repo.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 mt-auto">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{repo.language || 'N/A'}</span>
                      <span>⭐ {repo.starCount}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute bottom-4 right-4 h-8 w-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:text-white hover:scale-105 transition-transform shadow-lg"
                      onClick={(e) => { e.stopPropagation(); handleOpenEditDialog(repo); }}
                    >
                      Edit
                    </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700"
            onClick={handleSave}
          >
            Save Portfolio
          </Button>
          <Button
            variant="outline"
            className="px-8 py-3 text-lg"
            onClick={handleDownloadPdf}
          >
            Download PDF
          </Button>
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Repository Details</DialogTitle>
          </DialogHeader>
          {editingRepo && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Custom Title</Label>
                <Input
                  id="title"
                  value={editingRepo.customTitle}
                  onChange={(e) => setEditingRepo({ ...editingRepo, customTitle: e.target.value })}
                  className="col-span-3 bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label>Contributions (Bullet Points)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 mb-4 text-purple-300 border-purple-400 hover:bg-purple-900/50 hover:text-purple-200"
                    onClick={handleGenerateBullets}
                    disabled={isGenerating}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate with AI from README"}
                  </Button>
                <div className="mt-2 space-y-2">
                  {(editingRepo.customBulletPoints || []).map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={point}
                        onChange={(e) => handleBulletPointChange(index, e.target.value)}
                        placeholder={`Bullet point #${index + 1}`}
                        className="flex-1 bg-gray-700 border-gray-600"
                      />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeBulletPoint(index)}
                        className="h-9 w-9 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addBulletPoint} className="mt-2">
                    Add Bullet Point Manually
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}