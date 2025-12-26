import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import {
  ArrowLeft,
  Save,
  Download,
  Sparkles,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
  Award,
  FolderOpen,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Target,
  Wand2,
  ChevronRight,
  Share2,
} from "lucide-react";
import CVPreview from "@/components/cv/CVPreview";
import AIAnalysisPanel from "@/components/cv/AIAnalysisPanel";
import JobOptimizeModal from "@/components/cv/JobOptimizeModal";
import TemplateSelector from "@/components/cv/TemplateSelector";
import ShareModal from "@/components/cv/ShareModal";
import ProfileMenu from "@/components/ProfileMenu";
import { motion, AnimatePresence } from "framer-motion";

import { getJson, postJson, putJson, downloadPDF } from "@/lib/api";

const WIZARD_STEPS = [
  { id: "personal", labelKey: "step.personal", icon: User },
  { id: "summary", labelKey: "step.summary", icon: FileText },
  { id: "experience", labelKey: "step.experience", icon: Briefcase },
  { id: "education", labelKey: "step.education", icon: GraduationCap },
  { id: "skills", labelKey: "step.skills", icon: Code },
  { id: "languages", labelKey: "step.languages", icon: Globe },
  { id: "certificates", labelKey: "step.certificates", icon: Award },
  { id: "projects", labelKey: "step.projects", icon: FolderOpen },
];

export default function CVEditor() {
  const { cvId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [cv, setCV] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState("personal");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showJobOptimize, setShowJobOptimize] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  
  const saveTimeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  useEffect(() => {
    fetchCV();
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [cvId]);

  const fetchCV = async () => {
    try {
      const data = await getJson(`/cvs/${cvId}`);
      setCV(data);
      lastSavedRef.current = JSON.stringify(data);
    } catch (error) {
      console.error("Failed to fetch CV:", error);
      if (error.status === 404) {
        toast.error("CV not found");
        navigate("/dashboard");
      } else {
        toast.error("Failed to load CV");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveCV = useCallback(async (cvData) => {
    if (!cvData) return;
    
    const currentData = JSON.stringify(cvData);
    if (currentData === lastSavedRef.current) return;

    setSaving(true);
    try {
      await putJson(`/cvs/${cvId}`, {
        title: cvData.title,
        data: cvData.data,
        settings: cvData.settings,
      });
      lastSavedRef.current = currentData;
    } catch (error) {
      console.error("Failed to save CV:", error);
    } finally {
      setSaving(false);
    }
  }, [cvId]);

  const handleChange = useCallback((path, value) => {
    setCV((prev) => {
      const newCV = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = newCV;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;

      // Debounced autosave
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => saveCV(newCV), 1500);

      return newCV;
    });
  }, [saveCV]);

  const handleAddItem = (section) => {
    const newItem = {
      id: `${section}_${Date.now()}`,
      ...(section === "experiences" && { company: "", position: "", location: "", start_date: "", end_date: "", current: false, description: "" }),
      ...(section === "education" && { institution: "", degree: "", field: "", start_date: "", end_date: "", gpa: "", description: "" }),
      ...(section === "skills" && { name: "", level: "intermediate", category: "technical" }),
      ...(section === "languages" && { name: "", proficiency: "professional" }),
      ...(section === "certificates" && { name: "", issuer: "", date: "", url: "" }),
      ...(section === "projects" && { name: "", description: "", url: "", technologies: [] }),
    };

    handleChange(`data.${section}`, [...(cv.data[section] || []), newItem]);
  };

  const handleRemoveItem = (section, id) => {
    handleChange(`data.${section}`, cv.data[section].filter((item) => item.id !== id));
  };

  const handleImproveWithAI = async (section, content, itemId = null) => {
    const key = itemId || section;
    setAiLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const data = await postJson(`/ai/improve`, { section, content });
      if (itemId) {
        const sectionKey = section === "experience" ? "experiences" : section;
        const items = cv.data[sectionKey];
        const index = items.findIndex((i) => i.id === itemId);
        if (index !== -1) {
          const updated = [...items];
          updated[index] = { ...updated[index], description: data.improved };
          handleChange(`data.${sectionKey}`, updated);
        }
      } else if (section === "summary") {
        handleChange("data.summary", data.improved);
      }
      toast.success("AI improved your content!");
    } catch (error) {
      console.error("AI improve failed:", error);
      toast.error("Failed to improve with AI");
    } finally {
      setAiLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadPDF(cvId, cv.title);
      toast.success("PDF downloaded!");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!cv) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="navbar">
        <div className="max-w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Input
              value={cv.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="font-heading font-semibold text-lg border-0 bg-transparent focus-visible:ring-0 w-48"
              data-testid="cv-title"
            />
            <div className={`autosave-indicator ${saving ? "saving" : "saved"}`}>
              {saving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Saved
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowShare(true)} data-testid="share-btn" className="hidden sm:flex">
              <Share2 className="w-4 h-4 mr-2" />
              {t("share.title")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)} data-testid="templates-btn" className="hidden sm:flex">
              {t("editor.templates")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowJobOptimize(true)} data-testid="job-optimize-btn" className="hidden lg:flex">
              <Target className="w-4 h-4 mr-2" />
              {t("editor.optimizeForJob")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAnalysis(true)} data-testid="analyze-btn">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t("editor.aiAnalysis")}</span>
            </Button>
            <Button size="sm" onClick={handleDownloadPDF} data-testid="download-pdf-btn">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <ProfileMenu
              user={user}
              onLogout={async () => {
                await logout();
                navigate("/", { replace: true });
              }}
              showLanguage={true}
              showTheme={true}
            />
          </div>
        </div>
      </nav>

      {/* Main Editor */}
      <div className="editor-container">
        {/* Left: Wizard Steps */}
        <div className="sidebar">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="font-heading font-semibold text-sm text-foreground-muted uppercase tracking-wider mb-4">
                CV Sections
              </h3>
              <div className="space-y-1">
                {WIZARD_STEPS.map((step, index) => {
                  const isActive = activeStep === step.id;
                  const Icon = step.icon;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-smooth"
                          : "hover:bg-surface text-foreground"
                      }`}
                      data-testid={`step-${step.id}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{t(step.labelKey)}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Center: Form */}
        <div className="content-area overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeStep === "personal" && (
                    <PersonalInfoForm cv={cv} onChange={handleChange} />
                  )}
                  {activeStep === "summary" && (
                    <SummaryForm
                      cv={cv}
                      onChange={handleChange}
                      onImprove={handleImproveWithAI}
                      loading={aiLoading.summary}
                    />
                  )}
                  {activeStep === "experience" && (
                    <ExperienceForm
                      cv={cv}
                      onChange={handleChange}
                      onAdd={() => handleAddItem("experiences")}
                      onRemove={(id) => handleRemoveItem("experiences", id)}
                      onImprove={handleImproveWithAI}
                      loading={aiLoading}
                    />
                  )}
                  {activeStep === "education" && (
                    <EducationForm
                      cv={cv}
                      onChange={handleChange}
                      onAdd={() => handleAddItem("education")}
                      onRemove={(id) => handleRemoveItem("education", id)}
                    />
                  )}
                  {activeStep === "skills" && (
                    <SkillsForm
                      cv={cv}
                      onChange={handleChange}
                      onAdd={() => handleAddItem("skills")}
                      onRemove={(id) => handleRemoveItem("skills", id)}
                    />
                  )}
                  {activeStep === "languages" && (
                    <LanguagesForm
                      cv={cv}
                      onChange={handleChange}
                      onAdd={() => handleAddItem("languages")}
                      onRemove={(id) => handleRemoveItem("languages", id)}
                    />
                  )}
                  {activeStep === "certificates" && (
                    <CertificatesForm
                      cv={cv}
                      onChange={handleChange}
                      onAdd={() => handleAddItem("certificates")}
                      onRemove={(id) => handleRemoveItem("certificates", id)}
                    />
                  )}
                  {activeStep === "projects" && (
                    <ProjectsForm
                      cv={cv}
                      onChange={handleChange}
                      onAdd={() => handleAddItem("projects")}
                      onRemove={(id) => handleRemoveItem("projects", id)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Right: Preview */}
        <div className="border-l border-border bg-surface/30 overflow-hidden hidden xl:block">
          <div className="p-4 border-b border-border bg-surface">
            <h3 className="font-heading font-semibold text-foreground">Live Preview</h3>
          </div>
          <ScrollArea className="h-[calc(100vh-128px)]">
            <div className="p-4">
              <CVPreview cv={cv} scale={0.45} />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Modals */}
      {showAnalysis && (
        <AIAnalysisPanel cv={cv} onClose={() => setShowAnalysis(false)} />
      )}
      {showJobOptimize && (
        <JobOptimizeModal
          cv={cv}
          onClose={() => setShowJobOptimize(false)}
          onApply={(optimized) => {
            if (optimized.optimized_summary) {
              handleChange("data.summary", optimized.optimized_summary);
            }
            setShowJobOptimize(false);
            toast.success("CV optimized for the job!");
          }}
        />
      )}
      {showTemplates && (
        <TemplateSelector
          currentTemplate={cv.settings.template}
          onSelect={(template) => {
            handleChange("settings.template", template);
            setShowTemplates(false);
            toast.success("Template applied!");
          }}
          onClose={() => setShowTemplates(false)}
          isPro={user?.is_pro}
        />
      )}
      {showShare && (
        <ShareModal
          cvId={cvId}
          isPro={user?.is_pro}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

// Form Components

function PersonalInfoForm({ cv, onChange }) {
  const personal = cv.data.personal_info || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold mb-2 text-foreground">Personal Information</h2>
        <p className="text-foreground-muted">Add your contact details</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={personal.full_name || ""}
            onChange={(e) => onChange("data.personal_info.full_name", e.target.value)}
            placeholder="John Doe"
            data-testid="input-full-name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={personal.email || ""}
            onChange={(e) => onChange("data.personal_info.email", e.target.value)}
            placeholder="john@example.com"
            data-testid="input-email"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={personal.phone || ""}
            onChange={(e) => onChange("data.personal_info.phone", e.target.value)}
            placeholder="+1 234 567 890"
            data-testid="input-phone"
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={personal.location || ""}
            onChange={(e) => onChange("data.personal_info.location", e.target.value)}
            placeholder="New York, USA"
            data-testid="input-location"
          />
        </div>
        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={personal.linkedin || ""}
            onChange={(e) => onChange("data.personal_info.linkedin", e.target.value)}
            placeholder="linkedin.com/in/johndoe"
            data-testid="input-linkedin"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="website">Website / Portfolio</Label>
          <Input
            id="website"
            value={personal.website || ""}
            onChange={(e) => onChange("data.personal_info.website", e.target.value)}
            placeholder="https://johndoe.com"
            data-testid="input-website"
          />
        </div>
      </div>
    </div>
  );
}

function SummaryForm({ cv, onChange, onImprove, loading }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold mb-2 text-foreground">Professional Summary</h2>
          <p className="text-foreground-muted">Write a compelling summary of your experience</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onImprove("summary", cv.data.summary)}
          disabled={loading || !cv.data.summary}
          data-testid="improve-summary-btn"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
          Improve with AI
        </Button>
      </div>

      <Textarea
        value={cv.data.summary || ""}
        onChange={(e) => onChange("data.summary", e.target.value)}
        placeholder="Results-driven software engineer with 5+ years of experience..."
        className="min-h-[200px]"
        data-testid="input-summary"
      />
    </div>
  );
}

function ExperienceForm({ cv, onChange, onAdd, onRemove, onImprove, loading }) {
  const experiences = cv.data.experiences || [];

  const handleItemChange = (index, field, value) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    onChange("data.experiences", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold mb-2 text-foreground">Work Experience</h2>
          <p className="text-foreground-muted">Add your professional experience</p>
        </div>
        <Button onClick={onAdd} size="sm" data-testid="add-experience-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>

      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <Card key={exp.id} className="group relative">
            <CardContent className="pt-6">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={() => onRemove(exp.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Position</Label>
                  <Input
                    value={exp.position || ""}
                    onChange={(e) => handleItemChange(index, "position", e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={exp.company || ""}
                    onChange={(e) => handleItemChange(index, "company", e.target.value)}
                    placeholder="Tech Corp"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="month"
                    value={exp.start_date || ""}
                    onChange={(e) => handleItemChange(index, "start_date", e.target.value)}
                    placeholder="Jan 2020"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={exp.end_date || ""}
                    onChange={(e) => handleItemChange(index, "end_date", e.target.value)}
                    placeholder="Present"
                    disabled={exp.current}
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Description</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => onImprove("experience", exp.description, exp.id)}
                      disabled={loading[exp.id] || !exp.description}
                    >
                      {loading[exp.id] ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                      AI Improve
                    </Button>
                  </div>
                  <Textarea
                    value={exp.description || ""}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="• Led development of..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {experiences.length === 0 && (
          <div className="text-center py-8 text-foreground-muted">
            No experiences added yet. Click "Add Experience" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function EducationForm({ cv, onChange, onAdd, onRemove }) {
  const education = cv.data.education || [];

  const handleItemChange = (index, field, value) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange("data.education", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold mb-2 text-foreground">Education</h2>
          <p className="text-foreground-muted">Add your educational background</p>
        </div>
        <Button onClick={onAdd} size="sm" data-testid="add-education-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>

      <div className="space-y-6">
        {education.map((edu, index) => (
          <Card key={edu.id} className="group relative">
            <CardContent className="pt-6">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={() => onRemove(edu.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Institution</Label>
                  <Input
                    value={edu.institution || ""}
                    onChange={(e) => handleItemChange(index, "institution", e.target.value)}
                    placeholder="University of Example"
                  />
                </div>
                <div>
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree || ""}
                    onChange={(e) => handleItemChange(index, "degree", e.target.value)}
                    placeholder="Bachelor's"
                  />
                </div>
                <div>
                  <Label>Field of Study</Label>
                  <Input
                    value={edu.field || ""}
                    onChange={(e) => handleItemChange(index, "field", e.target.value)}
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="month"
                    value={edu.start_date || ""}
                    onChange={(e) => handleItemChange(index, "start_date", e.target.value)}
                    placeholder="2016"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={edu.end_date || ""}
                    onChange={(e) => handleItemChange(index, "end_date", e.target.value)}
                    placeholder="2020"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {education.length === 0 && (
          <div className="text-center py-8 text-foreground-muted">
            No education added yet. Click "Add Education" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function SkillsForm({ cv, onChange, onAdd, onRemove }) {
  const skills = cv.data.skills || [];

  const handleItemChange = (index, field, value) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange("data.skills", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold mb-2 text-foreground">Skills</h2>
          <p className="text-foreground-muted">Add your technical and soft skills</p>
        </div>
        <Button onClick={onAdd} size="sm" data-testid="add-skill-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={skill.id} className="flex items-center gap-4 group">
            <Input
              value={skill.name || ""}
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
              placeholder="JavaScript"
              className="flex-1"
            />
            <Select
              value={skill.level || "intermediate"}
              onValueChange={(value) => handleItemChange(index, "level", value)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={skill.category || "technical"}
              onValueChange={(value) => handleItemChange(index, "category", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="soft">Soft</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              onClick={() => onRemove(skill.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {skills.length === 0 && (
          <div className="text-center py-8 text-foreground-muted">
            No skills added yet. Click "Add Skill" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function LanguagesForm({ cv, onChange, onAdd, onRemove }) {
  const languages = cv.data.languages || [];

  const handleItemChange = (index, field, value) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    onChange("data.languages", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold mb-2 text-foreground">Languages</h2>
          <p className="text-foreground-muted">Add languages you speak</p>
        </div>
        <Button onClick={onAdd} size="sm" data-testid="add-language-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Language
        </Button>
      </div>

      <div className="space-y-4">
        {languages.map((lang, index) => (
          <div key={lang.id} className="flex items-center gap-4 group">
            <Input
              value={lang.name || ""}
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
              placeholder="English"
              className="flex-1"
            />
            <Select
              value={lang.proficiency || "professional"}
              onValueChange={(value) => handleItemChange(index, "proficiency", value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="native">Native</SelectItem>
                <SelectItem value="fluent">Fluent</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              onClick={() => onRemove(lang.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {languages.length === 0 && (
          <div className="text-center py-8 text-foreground-muted">
            No languages added yet. Click "Add Language" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function CertificatesForm({ cv, onChange, onAdd, onRemove }) {
  const certificates = cv.data.certificates || [];

  const handleItemChange = (index, field, value) => {
    const updated = [...certificates];
    updated[index] = { ...updated[index], [field]: value };
    onChange("data.certificates", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold mb-2 text-foreground">Certificates</h2>
          <p className="text-foreground-muted">Add your certifications</p>
        </div>
        <Button onClick={onAdd} size="sm" data-testid="add-certificate-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Certificate
        </Button>
      </div>

      <div className="space-y-6">
        {certificates.map((cert, index) => (
          <Card key={cert.id} className="group relative">
            <CardContent className="pt-6">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={() => onRemove(cert.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Certificate Name</Label>
                  <Input
                    value={cert.name || ""}
                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    placeholder="AWS Solutions Architect"
                  />
                </div>
                <div>
                  <Label>Issuer</Label>
                  <Input
                    value={cert.issuer || ""}
                    onChange={(e) => handleItemChange(index, "issuer", e.target.value)}
                    placeholder="Amazon Web Services"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    value={cert.date || ""}
                    onChange={(e) => handleItemChange(index, "date", e.target.value)}
                    placeholder="March 2023"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {certificates.length === 0 && (
          <div className="text-center py-8 text-foreground-muted">
            No certificates added yet. Click "Add Certificate" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectsForm({ cv, onChange, onAdd, onRemove }) {
  const projects = cv.data.projects || [];

  const handleItemChange = (index, field, value) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange("data.projects", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold mb-2 text-foreground">Projects</h2>
          <p className="text-foreground-muted">Showcase your personal projects</p>
        </div>
        <Button onClick={onAdd} size="sm" data-testid="add-project-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="space-y-6">
        {projects.map((project, index) => (
          <Card key={project.id} className="group relative">
            <CardContent className="pt-6">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={() => onRemove(project.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    value={project.name || ""}
                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    placeholder="My Awesome Project"
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={project.url || ""}
                    onChange={(e) => handleItemChange(index, "url", e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={project.description || ""}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="A brief description of the project..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-8 text-foreground-muted">
            No projects added yet. Click "Add Project" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
