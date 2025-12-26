import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  MoreVertical,
  Edit3,
  Trash2,
  Download,
  Moon,
  Sun,
  LogOut,
  User,
  Loader2,
  Sparkles,
  Globe,
  Crown,
  Menu,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout: authLogout } = useAuth();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [newTitle, setNewTitle] = useState(language === "tr" ? "Özgeçmişim" : "My Resume");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      const response = await fetch(`${API}/cvs`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setCvs(data);
      }
    } catch (error) {
      console.error("Failed to fetch CVs:", error);
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCV = async () => {
    setCreating(true);
    try {
      const response = await fetch(`${API}/cvs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        const cv = await response.json();
        toast.success(language === "tr" ? "Özgeçmiş oluşturuldu!" : "Resume created!");
        setShowNewModal(false);
        navigate(`/editor/${cv.cv_id}`);
      }
    } catch (error) {
      console.error("Failed to create CV:", error);
      toast.error(t("common.error"));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCV = async (cvId) => {
    try {
      const response = await fetch(`${API}/cvs/${cvId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setCvs(cvs.filter((cv) => cv.cv_id !== cvId));
        toast.success(language === "tr" ? "Özgeçmiş silindi" : "Resume deleted");
      }
    } catch (error) {
      console.error("Failed to delete CV:", error);
      toast.error(t("common.error"));
    }
  };

  const handleLogout = async () => {
    await authLogout();
    navigate("/", { replace: true });
  };

  const handleDownloadPDF = async (cvId, title) => {
    try {
      const response = await fetch(`${API}/generate-pdf/${cvId}`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("PDF " + (language === "tr" ? "indirildi!" : "downloaded!"));
      }
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error(t("common.error"));
    }
  };

  const handleUpgrade = async () => {
    try {
      const response = await fetch(`${API}/stripe/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ origin_url: window.location.origin }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
      toast.error(t("common.error"));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg sm:text-xl">SmartResume</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            {!user?.is_pro && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPremiumModal(true)}
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
                data-testid="upgrade-btn"
              >
                <Crown className="w-4 h-4 mr-2" />
                {t("premium.title")}
              </Button>
            )}
            
            {user?.is_pro && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                <Crown className="w-3 h-3 mr-1" />
                PRO
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="w-4 h-4 mr-1" />
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage("en")}>🇺🇸 English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("tr")}>🇹🇷 Türkçe</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="theme-toggle-dashboard"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="hidden lg:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout} data-testid="logout-btn">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{user?.name}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setLanguage("en")}>EN</Button>
                <Button size="sm" variant="ghost" onClick={() => setLanguage("tr")}>TR</Button>
                <Button size="sm" variant="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            {!user?.is_pro && (
              <Button
                variant="outline"
                className="w-full border-amber-500 text-amber-600"
                onClick={() => setShowPremiumModal(true)}
              >
                <Crown className="w-4 h-4 mr-2" />
                {t("premium.title")}
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t("nav.logout")}
            </Button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              {t("dashboard.title")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("dashboard.subtitle")}
            </p>
          </div>

          <Button
            onClick={() => setShowNewModal(true)}
            className="rounded-full btn-press w-full sm:w-auto"
            data-testid="create-cv-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t("dashboard.newResume")}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : cvs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="empty-state"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50" />
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-semibold mb-2">
              {t("dashboard.noResumes")}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              {t("dashboard.noResumesDesc")}
            </p>
            <Button onClick={() => setShowNewModal(true)} className="rounded-full btn-press">
              <Plus className="w-5 h-5 mr-2" />
              {t("dashboard.createResume")}
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" data-testid="cv-list">
            {cvs.map((cv, index) => (
              <motion.div
                key={cv.cv_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/editor/${cv.cv_id}`)}
                  data-testid={`cv-card-${cv.cv_id}`}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/editor/${cv.cv_id}`);
                          }}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            {t("dashboard.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(cv.cv_id, cv.title);
                          }}>
                            <Download className="w-4 h-4 mr-2" />
                            {t("dashboard.download")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCV(cv.cv_id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t("dashboard.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="font-heading font-semibold text-base sm:text-lg mb-1">{cv.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                      {t("dashboard.updated")} {cv.updated_at ? format(new Date(cv.updated_at), "MMM d, yyyy") : "recently"}
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="ai-badge">
                        <Sparkles className="w-3 h-3" />
                        {t("dashboard.aiReady")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* New Resume Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent data-testid="new-cv-modal">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("dashboard.newResume")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">{t("dashboard.resumeTitle")}</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={language === "tr" ? "Örn: Yazılım Mühendisi CV" : "e.g., Software Engineer Resume"}
              data-testid="cv-title-input"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowNewModal(false)} className="w-full sm:w-auto">
              {t("dashboard.cancel")}
            </Button>
            <Button onClick={handleCreateCV} disabled={creating} data-testid="create-cv-submit" className="w-full sm:w-auto">
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("dashboard.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Premium Modal */}
      <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
        <DialogContent className="max-w-md" data-testid="premium-modal">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              {t("premium.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-6">{t("premium.subtitle")}</p>
            
            <div className="text-center mb-6">
              <span className="text-4xl font-bold">{t("premium.price")}</span>
            </div>
            
            <ul className="space-y-3 mb-6">
              {["premium.feature1", "premium.feature2", "premium.feature3", "premium.feature4"].map((key) => (
                <li key={key} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">{t(key)}</span>
                </li>
              ))}
            </ul>
            
            <Button onClick={handleUpgrade} className="w-full" data-testid="subscribe-btn">
              {t("premium.subscribe")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
