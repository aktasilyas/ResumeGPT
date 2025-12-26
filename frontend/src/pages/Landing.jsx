import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
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
  Globe,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getJson } from "@/lib/api";

export default function Landing() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getJson(`/auth/me`);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        // Not authenticated, stay on landing
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const features = [
    {
      icon: Sparkles,
      title: t("feature.aiAnalysis"),
      description: t("feature.aiAnalysisDesc"),
    },
    {
      icon: Target,
      title: t("feature.jobOptimization"),
      description: t("feature.jobOptimizationDesc"),
    },
    {
      icon: LayoutTemplate,
      title: t("feature.templates"),
      description: t("feature.templatesDesc"),
    },
    {
      icon: Download,
      title: t("feature.pdfExport"),
      description: t("feature.pdfExportDesc"),
    },
    {
      icon: Zap,
      title: t("feature.smartSuggestions"),
      description: t("feature.smartSuggestionsDesc"),
    },
    {
      icon: Shield,
      title: t("feature.atsCompatible"),
      description: t("feature.atsCompatibleDesc"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg sm:text-xl">SmartResume</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="language-switcher">
                  <Globe className="w-4 h-4 mr-1" />
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("tr")}>
                  🇹🇷 Türkçe
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <Button variant="ghost" onClick={handleLogin} data-testid="login-btn">
              {t("nav.login")}
            </Button>
            
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="rounded-full px-6"
              data-testid="get-started-btn"
            >
              {isLoading ? "..." : t("nav.getStarted")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-card border-t"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("nav.login")}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setLanguage("en")}>EN</Button>
                    <Button size="sm" variant="ghost" onClick={() => setLanguage("tr")}>TR</Button>
                    <Button size="sm" variant="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleLogin}>
                  {t("nav.login")}
                </Button>
                <Button className="w-full" onClick={handleGoogleLogin}>
                  {t("nav.getStarted")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 hero-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="ai-badge mb-4 sm:mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                {t("landing.badge")}
              </div>
              
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                {t("landing.title")}
                <span className="block text-primary">{t("landing.titleHighlight")}</span>
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg">
                {t("landing.subtitle")}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  size="lg"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="rounded-full px-6 sm:px-8 text-base btn-press w-full sm:w-auto"
                  data-testid="hero-cta"
                >
                  {t("landing.cta")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-6 sm:px-8 text-base w-full sm:w-auto"
                >
                  {t("landing.viewTemplates")}
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 sm:mt-10">
                {[
                  t("landing.freeToStart"),
                  t("landing.noCredit"),
                  t("landing.aiPowered"),
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {t("landing.featuresTitle")}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              {t("landing.featuresSubtitle")}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="feature-card bg-card rounded-xl p-6 sm:p-8 border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg sm:text-xl mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {t("landing.howItWorks")}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              {t("landing.howItWorksSubtitle")}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: t("landing.step1Title"), desc: t("landing.step1Desc") },
              { step: "02", title: t("landing.step2Title"), desc: t("landing.step2Desc") },
              { step: "03", title: t("landing.step3Title"), desc: t("landing.step3Desc") },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="font-heading text-5xl sm:text-6xl font-bold text-primary/20 mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold text-lg sm:text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            {t("landing.ctaTitle")}
          </h2>
          <p className="text-primary-foreground/80 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
            {t("landing.ctaSubtitle")}
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleGoogleLogin}
            className="rounded-full px-8 sm:px-10 text-base btn-press"
            data-testid="cta-btn"
          >
            {t("landing.ctaButton")}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 bg-card border-t">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
