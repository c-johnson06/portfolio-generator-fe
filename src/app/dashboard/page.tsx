"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { X, Sparkles, FileText, BarChart3 } from "lucide-react";
import { ApiClient } from "@/lib/api-client";

type User = {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  email: string;
  linkedIn: string;
  summary: string;
  skills?: string[];
  isPremium?: boolean;
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

type ComparativeAnalysisResult = {
  identifiedJobSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  rankedProjects: { projectName: string; relevanceJustification: string }[];
  overallSummary: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRepo, setEditingRepo] = useState<Repo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<string>("");
  const [isCoverLetterDialogOpen, setIsCoverLetterDialogOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isComparativeAnalysisDialogOpen, setIsComparativeAnalysisDialogOpen] = useState(false);
  const [analysisJobDescription, setAnalysisJobDescription] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<ComparativeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use ApiClient instead of fetch - automatically handles 401 redirects
      const userData: User = await ApiClient.get('/api/user/me');
      const reposData: Repo[] = await ApiClient.get('/api/user/repos');
      
      let initializedRepos = (Array.isArray(reposData) ? reposData : []).map(repo => ({ 
        ...repo, 
        selected: false,
        customTitle: repo.name,
        customBulletPoints: []
      }));
      
      // Try to load resume data if it exists
      try {
        const resumeData = await ApiClient.get('/api/user/resume');
        const savedRepos = resumeData.selectedRepositories;
        
        initializedRepos = (Array.isArray(reposData) ? reposData : []).map(repo => {
          const savedRepo = savedRepos.find((sr: { repoId: string; customTitle?: string; customBulletPoints?: string[] }) => sr.repoId === repo.id);
          return {
            ...repo,
            selected: !!savedRepo,
            customTitle: savedRepo?.customTitle || repo.name,
            customBulletPoints: savedRepo?.customBulletPoints || []
          };
        });

        setSkills(resumeData.skills || []);
        
        setUser({
          ...userData,
          email: resumeData.user.email,
          linkedIn: resumeData.user.linkedIn,
          summary: resumeData.user.professionalSummary,
          isPremium: resumeData.user.isPremium || false
        });
      } catch (resumeError) {
        // Resume not found - use default user data
        console.log("No resume data found, using defaults");
        setUser(userData);
      }
      
      setRepos(initializedRepos);
      setError(null);

    } catch (err) {
      // 401 errors will auto-redirect, so this catches other errors
      if (err instanceof Error && err.message !== 'Unauthorized') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

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
      skills: skills,
      selectedRepositories: selectedRepositories.map(repo => ({
        repoId: repo.id,
        name: repo.name,
        description: repo.description,
        customDescription: "",
        language: repo.language,
        starCount: repo.starCount,
        url: repo.url,
        customTitle: repo.customTitle || repo.name,
        customBulletPoints: repo.customBulletPoints || [],
      })),
    };

    try {
      await ApiClient.post('/api/user/resume', resumeData);
      alert("Portfolio saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while saving.");
      alert(err instanceof Error ? err.message : "Failed to save portfolio");
    }
  };

  const handleDownloadPdf = () => {
    if (!user) return;
    window.open(`${ApiClient.getBaseUrl()}/api/pdf/resume/${user.login}/pdf`, '_blank');
  };
  
  const handleOpenEditDialog = (repo: Repo) => {
    setEditingRepo({ ...repo });
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

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleGenerateBullets = async () => {
    if (!editingRepo || !user) return;
    setIsGenerating(true);
    try {
      const data = await ApiClient.post('/api/ai/generate-bullets', {
        owner: user.login,
        repoName: editingRepo.name,
      });

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
  
  const extractSkills = async () => {
    if (!user) return;
    
    try {
      const selectedRepoNames = repos
        .filter(repo => repo.selected)
        .map(repo => repo.name);
      
      if (selectedRepoNames.length === 0) {
        alert("Please select at least one repository to extract skills from");
        return;
      }
      
      const data = await ApiClient.post('/api/user/extract-skills', {
        owner: user.login,
        repoNames: selectedRepoNames
      });
      
      setSkills(data.skills);
    } catch (error) {
      console.error("Error extracting skills:", error);
      alert(error instanceof Error ? error.message : "Error extracting skills");
    }
  };

  const handleGenerateCoverLetter = () => {
    const selectedCount = repos.filter(repo => repo.selected).length;
    if (selectedCount === 0) {
        alert("Please select at least one repository before generating a cover letter.");
        return;
    }
    setCoverLetter("");
    setIsCoverLetterDialogOpen(true);
  };

  const handleGenerateCoverLetterSubmit = async () => {
    if (!user) return;

    const selectedRepoNames = repos.filter(repo => repo.selected).map(repo => repo.name);
    if (selectedRepoNames.length === 0 || !jobDescription.trim()) {
        alert("Please select repositories and provide a job description.");
        return;
    }

    setIsGeneratingCoverLetter(true);
    setCoverLetter("");

    try {
      const data = await ApiClient.post('/api/ai/generate-cover-letter', {
        owner: user.login,
        repoNames: selectedRepoNames,
        positionRequirements: jobDescription,
      });

      setCoverLetter(data.coverLetter);
    } catch (err) {
      console.error("Error generating cover letter:", err);
      alert(err instanceof Error ? err.message : "An unknown error occurred while generating the cover letter.");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };
  
  const handleRunComparativeAnalysis = () => {
    const selectedCount = repos.filter(repo => repo.selected).length;
    if (selectedCount === 0) {
        alert("Please select at least one repository before running comparative analysis.");
        return;
    }
    setAnalysisResult(null);
    setIsComparativeAnalysisDialogOpen(true);
  };

  const handleRunComparativeAnalysisSubmit = async () => {
    if (!user) return;

    const selectedRepoNames = repos.filter(repo => repo.selected).map(repo => repo.name);
    if (selectedRepoNames.length === 0 || !analysisJobDescription.trim()) {
        alert("Please select repositories and provide a job description.");
        return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const data = await ApiClient.post('/api/ai/compare-portfolio', {
        jobDescription: analysisJobDescription,
      });

      setAnalysisResult(data);
    } catch (err) {
      console.error("Error running comparative analysis:", err);
      
      // Check if it's a premium feature error
      if (err instanceof Error && (err.message.includes("premium") || err.message.includes("403") || err.message.includes("402"))) {
        alert("This feature requires a premium account. Please upgrade to access comparative analysis.");
      } else {
        alert(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
      }
    } finally {
      setIsAnalyzing(false);
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
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Return to Home
          </Button>
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
            {user.isPremium && (
              <div className="mt-2 inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                PREMIUM USER
              </div>
            )}
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
          <h2 className="text-2xl font-semibold text-white mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className="flex items-center bg-purple-600 text-white px-3 py-1 rounded-full text-sm"
              >
                {skill}
                <button 
                  onClick={() => removeSkill(index)}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="bg-gray-700 text-white border-gray-600"
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            />
            <Button onClick={addSkill} className="bg-purple-600 hover:bg-purple-700">
              Add
            </Button>
          </div>
          <Button 
            onClick={extractSkills}
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Extract Skills from Selected Repositories
          </Button>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Select & Edit Repositories</h2>
                <p className="text-gray-400 mb-4">Click on a repository card to select or deselect it for your portfolio. Click &quot;Edit&quot; to customize its details.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="lg" 
                  className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                >
                  Save Portfolio
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-3 text-lg"
                  onClick={handleDownloadPdf}
                >
                  Download Portfolio
                </Button>
                <Button
                  size="lg"
                  className="px-8 py-3 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleGenerateCoverLetter}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Generate Cover Letter
                </Button>
                <Button
                  size="lg"
                  className="px-8 py-3 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  onClick={handleRunComparativeAnalysis}
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Comparative Analysis
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repos.map((repo) => (
                <Card
                  key={repo.id}
                  className={`cursor-pointer transition-all duration-200 flex flex-col ${
                    repo.selected 
                      ? "border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/10" 
                      : "border-gray-700 bg-gray-750 hover:border-gray-500"
                  }`}
                  onClick={() => handleSelectRepo(repo.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-white truncate">
                        {repo.customTitle || repo.name}
                      </CardTitle>
                      {repo.selected && (
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Selected
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{repo.description}</p>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                      <span className="bg-gray-700 px-2 py-1 rounded">{repo.language || 'N/A'}</span>
                      <span className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{repo.starCount}</span>
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:text-white"
                      onClick={(e) => { e.stopPropagation(); handleOpenEditDialog(repo); }}
                    >
                      Edit Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  className="col-span-3"
                />
              </div>
              <div>
                <Label>Custom Description (Bullet Points)</Label>
                  <Button
                    size="sm"
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:text-white duration-150 hover:scale-104"
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
                        className="flex-1"
                      />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeBulletPoint(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addBulletPoint} className="mt-2 text-black hover:bg-gray-200">
                    Add Bullet Point Manually
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSaveChanges} className="mt-2 bg-green-500 rounded transition-colors duration-300 hover:bg-green-400">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCoverLetterDialogOpen} onOpenChange={setIsCoverLetterDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Generate Cover Letter</DialogTitle>
          </DialogHeader>
          {coverLetter ? (
            <div className="grid gap-4 py-4">
              <h3 className="text-lg font-semibold mb-2">Generated Cover Letter:</h3>
              <div className="bg-gray-700/50 p-4 rounded-lg whitespace-pre-line border border-gray-600 max-h-[60vh] overflow-y-auto">
                {coverLetter}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <Label htmlFor="jobDescription" className="text-white">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="mt-2 bg-gray-700/50 text-white border-gray-600 min-h-[200px]"
              />
              <p className="text-sm text-gray-400 mt-2">
                The AI will use your selected repositories ({repos.filter(r => r.selected).length} selected) and this job description to generate a personalized cover letter.
                {repos.filter(r => r.selected).length > 4 && " Note: Only the first 4 selected repositories will be used."}
              </p>
            </div>
          )}
          <DialogFooter>
            {!coverLetter && (
              <Button 
                onClick={handleGenerateCoverLetterSubmit} 
                disabled={isGeneratingCoverLetter}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGeneratingCoverLetter ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </span>
                )}
              </Button>
            )}
            {coverLetter && (
              <Button 
                onClick={() => setCoverLetter("")}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
              >
                Generate New
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isComparativeAnalysisDialogOpen} onOpenChange={setIsComparativeAnalysisDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Comparative Portfolio Analysis</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {analysisResult ? (
              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-400">Identified Job Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.identifiedJobSkills.map((skill, index) => (
                      <span key={index} className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/50">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-green-400">Skills Demonstrated</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.matchedSkills.map((skill, index) => (
                      <span key={index} className="bg-green-600/30 text-green-300 px-3 py-1 rounded-full text-sm border border-green-500/50">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-red-400">Skills Gaps</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missingSkills.map((skill, index) => (
                      <span key={index} className="bg-red-600/30 text-red-300 px-3 py-1 rounded-full text-sm border border-red-500/50">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Project Relevance Ranking</h3>
                  <div className="space-y-3">
                    {analysisResult.rankedProjects.map((project, index) => (
                      <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{index + 1}. {project.projectName}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-2">{project.relevanceJustification}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Overall Assessment</h3>
                  <p className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 text-gray-200">
                    {analysisResult.overallSummary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <Label htmlFor="analysisJobDescription" className="text-white">Job Description</Label>
                <Textarea
                  id="analysisJobDescription"
                  placeholder="Paste the job description here..."
                  value={analysisJobDescription}
                  onChange={(e) => setAnalysisJobDescription(e.target.value)}
                  className="mt-2 bg-gray-700/50 text-white border-gray-600 min-h-[200px]"
                />
                <p className="text-sm text-gray-400 mt-2">
                  The AI will analyze your selected repositories ({repos.filter(r => r.selected).length} selected) against this job description.
                  {repos.filter(r => r.selected).length > 4 && " Note: Analysis may consider the first 4 selected repositories."}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            {!analysisResult && (
              <Button 
                onClick={handleRunComparativeAnalysisSubmit} 
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAnalyzing ? ( 
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Run Analysis
                  </span>
                )}
              </Button>
            )}
            {analysisResult && (
              <Button 
                onClick={() => setAnalysisResult(null)}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
              >
                Analyze Again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}