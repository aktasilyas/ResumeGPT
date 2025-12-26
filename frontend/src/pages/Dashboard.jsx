import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(location.state?.user || null);
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("My Resume");

  useEffect(() => {
    fetchUser();
    fetchCVs();
  }, []);

  const fetchUser = async () => {
    if (user) return;
    try {
      const response = await fetch(`${API}/auth/me`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const fetchCVs = async () => {
    try {
      const response = await fetch(`${API}/cvs`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setCvs(data);
      }
    } catch (error) {
      console.error("Failed to fetch CVs:", error);
      toast.error("Failed to load resumes");
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
        toast.success("Resume created!");
        setShowNewModal(false);
        navigate(`/editor/${cv.cv_id}`);
      }
    } catch (error) {
      console.error("Failed to create CV:", error);
      toast.error("Failed to create resume");
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
        toast.success("Resume deleted");
      }
    } catch (error) {
      console.error("Failed to delete CV:", error);
      toast.error("Failed to delete resume");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
        toast.success("PDF downloaded!");
      }
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
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
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout} data-testid="logout-btn">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">My Resumes</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your professional resumes
            </p>
          </div>

          <Button
            onClick={() => setShowNewModal(true)}
            className="rounded-full btn-press"
            data-testid="create-cv-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Resume
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
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">No resumes yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first AI-powered resume to get started
            </p>
            <Button onClick={() => setShowNewModal(true)} className="rounded-full btn-press">
              <Plus className="w-5 h-5 mr-2" />
              Create Resume
            </Button>
          </motion.div>
        ) : (
          <div className="dashboard-grid" data-testid="cv-list">
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
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
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
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(cv.cv_id, cv.title);
                          }}>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCV(cv.cv_id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="font-heading font-semibold text-lg mb-1">{cv.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Updated {cv.updated_at ? format(new Date(cv.updated_at), "MMM d, yyyy") : "recently"}
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="ai-badge">
                        <Sparkles className="w-3 h-3" />
                        AI Ready
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
            <DialogTitle className="font-heading">Create New Resume</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Resume Title</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Software Engineer Resume"
              data-testid="cv-title-input"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCV} disabled={creating} data-testid="create-cv-submit">
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
