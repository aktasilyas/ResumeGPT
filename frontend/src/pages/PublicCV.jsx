import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import { useTheme } from "@/components/ThemeProvider";
import CVPreview from "@/components/cv/CVPreview";
import { FileText, Loader2, AlertCircle, Eye, Moon, Sun, Globe, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { getJson } from "@/lib/api";

export default function PublicCV() {
  const { shareToken } = useParams();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicCV();
  }, [shareToken]);

  const fetchPublicCV = async () => {
    try {
      const result = await getJson(`/public/cv/${shareToken}`);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch public CV:", err);
      if (err.status === 404) setError("not_found");
      else setError("error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">
            {error === "not_found" ? "CV Not Found" : t("common.error")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {error === "not_found"
              ? "This resume link may have expired or been deleted."
              : "Something went wrong. Please try again."}
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const { cv, owner, views } = data;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg sm:text-xl text-foreground">ResumeGPT</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{views} {t("share.views")}</span>
              <span className="sm:hidden">{views}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
            >
              <Globe className="w-4 h-4 mr-1" />
              {language.toUpperCase()}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Owner Info */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-4">
            {owner?.picture ? (
              <img
                src={owner.picture}
                alt={owner.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-primary">
                  {owner?.name?.charAt(0) || "?"}
                </span>
              </div>
            )}
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold">{cv?.title}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {language === "tr" ? "Hazırlayan" : "Created by"}: {owner?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CV Preview */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
            <CVPreview cv={cv} scale={0.7} />
          </div>
        </motion.div>
      </main>

      {/* Footer CTA */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            {language === "tr"
              ? "Siz de profesyonel özgeçmişinizi oluşturun!"
              : "Create your professional resume too!"}
          </h2>
          <p className="text-primary-foreground/80 mb-4 sm:mb-6 text-sm sm:text-base">
            {language === "tr"
              ? "Yapay zeka destekli ResumeGPT ile dakikalar içinde etkileyici bir özgeçmiş oluşturun."
              : "Build an impressive resume in minutes with AI-powered ResumeGPT."}
          </p>
          <Link to="/">
            <Button variant="secondary" size="lg" className="rounded-full px-8">
              {t("landing.cta")}
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
