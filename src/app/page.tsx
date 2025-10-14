"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, FileText, Wand2, Sparkles, Newspaper, BadgePlus } from "lucide-react";
import { motion, easeOut } from "framer-motion";

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    window.location.href = "https://localhost:7089/auth/login";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: easeOut }
    }
  };

  const featureCardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.2 * i,
        duration: 0.6,
        ease: easeOut
      }
    })
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-900 text-white overflow-x-hidden">

      {/* Header */}
      <header className={`container mx-auto px-4 py-6 flex justify-between items-center sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/90 backdrop-blur-sm py-4' : ''}`}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Newspaper className="h-6 w-6 text-purple-400" />
        </motion.div>
        
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild className="text-gray-300 hover:text-black">
            <a href="/">Home</a>
          </Button>
          <Button variant="ghost" asChild className="text-gray-300 hover:text-black">
            <a href="/dashboard">Dashboard</a>
          </Button>
          <Button variant="ghost" asChild className="text-gray-300 hover:text-black">
            <a href="#">Examples</a>
          </Button>
          <Button 
            variant="secondary" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            onClick={handleLogin}
          >
            Login
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="container mx-auto px-4 flex flex-col items-center justify-center text-center py-14 md:py-22 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <BadgePlus className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">New: AI-Powered Comparative Analysis</span>
              <div className="h-1 w-1 bg-green-400 rounded-full animate-pulse"></div>
            </motion.div>
            
            <motion.h1 
              className="text-3xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Craft Your Developer Portfolio in Minutes
            </motion.h1>
            
            <motion.p 
              className="max-w-2xl text-lg md:text-xl text-gray-300 mb-8 mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              Stop worrying about design and deployment. Connect your GitHub, select your best projects, and let us generate a professional, shareable portfolio for you.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/20"
                onClick={handleLogin}
              >
                <Github className="mr-2 h-5 w-5" /> 
                Get Started with GitHub
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-gray-700 hover:bg-gray-300"
                asChild
              >
                <a href="#features" className="text-lg px-8 py-6 text-black">
                  See How It Works
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={itemVariants} className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-purple-400">10K+</div>
                <div className="text-gray-400 mt-2">Portfolios Created</div>
              </motion.div>
              <motion.div variants={itemVariants} className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-blue-400">98%</div>
                <div className="text-gray-400 mt-2">User Satisfaction</div>
              </motion.div>
              <motion.div variants={itemVariants} className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-green-400">5 min</div>
                <div className="text-gray-400 mt-2">Average Setup Time</div>
              </motion.div>
              <motion.div variants={itemVariants} className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">24/7</div>
                <div className="text-gray-400 mt-2">Support Available</div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="max-w-2xl mx-auto text-gray-400">
                Our simple 3-step process helps you create a professional portfolio in minutes
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {/* Card 1 */}
              <motion.div 
                custom={0}
                variants={featureCardVariants}
                className="group"
              >
                <Card className="bg-gray-800/50 border-gray-700 h-full backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                  <CardHeader className="text-center">
                    <div className="mx-auto bg-gray-700/50 p-4 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <Github className="h-8 w-8 text-white group-hover:text-purple-400 transition-colors" />
                    </div>
                    <CardTitle className="mt-4 text-xl text-white flex items-center justify-center gap-2">
                      Connect GitHub
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-gray-400">
                    Securely connect your GitHub account to fetch your public repositories with one click.
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card 2 */}
              <motion.div 
                custom={1}
                variants={featureCardVariants}
                className="group"
              >
                <Card className="bg-gray-800/50 border-gray-700 h-full backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                  <CardHeader className="text-center">
                    <div className="mx-auto bg-gray-700/50 p-4 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Wand2 className="h-8 w-8 text-white group-hover:text-blue-400 transition-colors" />
                    </div>
                    <CardTitle className="mt-4 text-xl text-white flex items-center justify-center gap-2">
                      Curate & Customize
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-gray-400">
                    Select your best projects and customize titles, descriptions, and highlight your contributions.
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card 3 */}
              <motion.div 
                custom={2}
                variants={featureCardVariants}
                className="group"
              >
                <Card className="bg-gray-800/50 border-gray-700 h-full backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                  <CardHeader className="text-center">
                    <div className="mx-auto bg-gray-700/50 p-4 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <FileText className="h-8 w-8 text-white group-hover:text-green-400 transition-colors" />
                    </div>
                    <CardTitle className="mt-4 text-xl text-white flex items-center justify-center gap-2">
                      Generate & Share
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-gray-400">
                    Instantly generate a beautiful portfolio and get a shareable link to showcase your work.
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-gray-700 rounded-2xl p-8 md:p-12 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to showcase your work?
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                Join thousands of developers who have created professional portfolios in minutes.
              </p>
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleLogin}
              >
                Start Building Your Portfolio
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Newspaper className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-gray-400 text-sm">
              {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}