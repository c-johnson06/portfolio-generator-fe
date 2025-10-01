PortfolioGen
PortfolioGen is a full-stack web application that allows developers to generate professional portfolios from their GitHub repositories. The application provides a dashboard for users to select and customize their projects, and then generates a downloadable PDF portfolio.

Features
GitHub Authentication: Securely log in with your GitHub account
Repository Selection: Choose which repositories to include in your portfolio
Customization: Edit project titles and add custom bullet points
PDF Generation: Download a professional PDF portfolio
Responsive Design: Works on all device sizes
Tech Stack
Backend
.NET 8: Web API framework
Entity Framework Core: ORM for database operations
SQLite: Database for storing user data
Octokit: GitHub API client
PuppeteerSharp: PDF generation
ASP.NET Core Authentication: OAuth with GitHub
Frontend
Next.js 14: React framework
TypeScript: Type-safe JavaScript
Tailwind CSS: Utility-first CSS framework
shadcn/ui: Reusable UI components
Lucide React: Icon library
Getting Started
Prerequisites
.NET 8 SDK
Node.js
Git
Installation
Clone the repository
bash


1
2
git clone https://github.com/your-username/portfolio-gen.git
cd portfolio-gen
Backend Setup
Navigate to the backend directory
Create a appsettings.Development.json file with your GitHub OAuth credentials:
json


1
2
3
4
5
6
7
8
9
⌄
⌄
⌄
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=portfolio.db"
  },
  "GitHub": {
    "ClientID": "your-github-client-id",
    "ClientSecret": "your-github-client-secret"
  }
}
Run the application:
bash


1
dotnet run
Frontend Setup
Navigate to the frontend directory
Install dependencies:
bash


1
npm install
Run the development server:
bash


1
npm run dev
GitHub OAuth Setup
Go to GitHub Developer Settings
Create a new OAuth application
Set the Homepage URL to http://localhost:3000
Set the Authorization callback URL to http://localhost:7089/signin-github
Use the generated Client ID and Client Secret in your appsettings.json
Project Structure


1
2
3
4
5
6
7
8
9
10
portfolio-gen/
├── backend/
│   ├── Controllers/
│   ├── Data/
│   ├── Models/
│   └── Program.cs
└── frontend/
    ├── components/
    ├── app/
    └── package.json
API Endpoints
Authentication
GET /auth/login - Initiate GitHub OAuth flow
User
GET /api/user/me - Get current user info
GET /api/user/repos - Get user repositories
POST /api/user/resume - Save resume data
GET /api/user/resume - Get resume data
PDF
GET /api/pdf/resume/{username}/pdf - Generate and download PDF
Environment Variables
Backend
Create appsettings.Development.json:

json


1
2
3
4
5
6
7
8
9
⌄
⌄
⌄
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=portfolio.db"
  },
  "GitHub": {
    "ClientID": "your-github-client-id",
    "ClientSecret": "your-github-client-secret"
  }
}
Frontend
Create .env.local:

env


1
NEXT_PUBLIC_API_URL=http://localhost:7089
Deployment
Backend (Azure App Service)
Publish your .NET application
Deploy to Azure App Service
Configure environment variables in Azure portal
Frontend (Vercel)
Push your code to a Git repository
Connect to Vercel
Configure environment variables in Vercel dashboard
Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
Octokit for GitHub API integration
PuppeteerSharp for PDF generation
shadcn/ui for beautiful UI components
Lucide for consistent icons
Support
If you encounter any issues, please open an issue in the repository. For questions, feel free to reach out to the maintainers.