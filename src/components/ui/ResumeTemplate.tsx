import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Mail, Linkedin, ExternalLink, Code, Calendar, Star } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  customTitle: string;
  customDescription: string;
  language: string;
  starCount: number;
  url: string;
  customBulletPoints: string[];
  addedAt: string; // This will be used as the project date
}

interface ResumeData {
  user: {
    name: string;
    email: string;
    linkedIn: string;
    professionalSummary: string;
    contactInfo: string; // Additional contact info
    githubLogin: string;
  };
  selectedRepositories: Project[];
  skills?: string[]; // Additional skills the user can manually add
}

interface ResumeTemplateProps {
  data: ResumeData;
}

export function ResumeTemplate({ data }: ResumeTemplateProps) {
  const { user, selectedRepositories, skills = [] } = data;

  // Extract unique languages from projects for skills section
  const projectLanguages = Array.from(
    new Set(
      selectedRepositories
        .map(repo => repo.language)
        .filter(lang => lang && lang.trim() !== '')
    )
  );

  // Combine project languages with user-added skills
  const allSkills = Array.from(new Set([...projectLanguages, ...skills]));

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-gray-900 font-sans">
      {/* Header Section */}
      <header className="mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <Linkedin className="h-4 w-4" />
            <span>{user.linkedIn}</span>
          </div>
          <div className="flex items-center gap-1">
            <Github className="h-4 w-4" />
            <span>github.com/{user.githubLogin}</span>
          </div>
          {user.contactInfo && (
            <div className="flex items-center gap-1">
              <span>{user.contactInfo}</span>
            </div>
          )}
        </div>
        {user.professionalSummary && (
          <p className="mt-4 text-gray-700 leading-relaxed">
            {user.professionalSummary}
          </p>
        )}
      </header>

      {/* Skills Section */}
      {allSkills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
            Skills & Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                {skill}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          Projects
        </h2>
        <div className="space-y-6">
          {selectedRepositories.map((repo) => (
            <div key={repo.id} className="break-inside-avoid">
              <Card className="border border-gray-200 shadow-none">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {repo.customTitle || repo.name}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Code className="h-3 w-3" />
                          <span>{repo.language || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Star className="h-3 w-3" />
                          <span>{repo.starCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(repo.addedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <a 
                      href={repo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    {repo.customDescription || repo.description}
                  </p>
                  {repo.customBulletPoints && repo.customBulletPoints.length > 0 && (
                    <ul className="space-y-1">
                      {repo.customBulletPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2 text-blue-600">•</span>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 pt-8 border-t border-gray-200">
        <p>Generated from PortfolioGen • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default ResumeTemplate;