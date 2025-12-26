import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import {
  FileText,
  Sparkles,
  Target,
  Download,
  CheckCircle2,
  ArrowRight,
  Moon,
  Sun,
  Zap,
  Shield,
  LayoutTemplate,
} from "lucide-react";
import { motion } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Landing() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API}/auth/me`, { credentials: "include" });
        if (response.ok) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        // Not authenticated, stay on landing
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = () => {
    setIsLoading(true);
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Analysis",
      description: "Get instant feedback on your CV with AI scoring and suggestions for improvement.",
    },
    {
      icon: Target,
      title: "Job Optimization",
      description: "Tailor your resume for specific job descriptions and increase your match rate.",
    },
    {
      icon: LayoutTemplate,
      title: "Professional Templates",
      description: "Choose from modern, ATS-friendly templates designed by career experts.",
    },
    {
      icon: Download,
      title: "PDF Export",
      description: "Download your resume as a pixel-perfect PDF ready for applications.",
    },
    {
      icon: Zap,
      title: "Smart Suggestions",
      description: "AI rewrites weak descriptions and suggests stronger action verbs.",
    },
    {
      icon: Shield,
      title: "ATS Compatible",
      description: "Ensure your resume passes Applicant Tracking Systems every time.",
    },
  ];

  const testimonials = [
    { name: "Sarah M.", role: "Software Engineer", quote: "Landed my dream job at a FAANG company!" },
    { name: "James K.", role: "Marketing Manager", quote: "The AI suggestions were incredibly helpful." },
    { name: "Emily R.", role: "Data Scientist", quote: "Best resume builder I've ever used." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl">SmartResume</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="rounded-full px-6"
              data-testid="login-btn"
            >
              {isLoading ? "Redirecting..." : "Get Started"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 hero-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="ai-badge mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Powered by AI
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Build Your Perfect
                <span className="block text-primary">Resume in Minutes</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Create professional, ATS-optimized resumes with AI-powered analysis. 
                Stand out from the crowd and land your dream job.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="rounded-full px-8 text-base btn-press"
                  data-testid="hero-cta"
                >
                  Create Your Resume
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 text-base"
                >
                  View Templates
                </Button>
              </div>
              
              <div className="flex items-center gap-6 mt-10">
                {[
                  "Free to start",
                  "No credit card",
                  "AI-powered",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/4069291/pexels-photo-4069291.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Professional workspace"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-xl border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">AI Score</p>
                      <p className="text-2xl font-bold text-primary">92/100</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to help you create the perfect resume
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="feature-card bg-card rounded-xl p-8 border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to your perfect resume
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Enter Your Info", desc: "Fill in your details using our intuitive wizard interface" },
              { step: "02", title: "AI Analysis", desc: "Get instant feedback and suggestions to improve your resume" },
              { step: "03", title: "Download PDF", desc: "Export your polished resume ready for applications" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="font-heading text-6xl font-bold text-primary/20 mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have improved their careers with SmartResume.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleLogin}
            className="rounded-full px-10 text-base btn-press"
            data-testid="cta-btn"
          >
            Start Building for Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-card border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold">SmartResume</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 SmartResume. Built with AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
