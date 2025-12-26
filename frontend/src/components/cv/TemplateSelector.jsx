import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Check } from "lucide-react";
import { motion } from "framer-motion";

const TEMPLATES = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple design",
    preview: "bg-white",
    headerColor: "bg-white border-b-2 border-primary",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional business style",
    preview: "bg-white",
    headerColor: "bg-slate-800",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Modern with color accents",
    preview: "bg-white",
    headerColor: "bg-gradient-to-r from-primary to-emerald-600",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Dark theme for developers",
    preview: "bg-slate-900",
    headerColor: "bg-slate-900 border-b border-lime-400",
  },
];

export default function TemplateSelector({ currentTemplate, onSelect, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose} data-testid="template-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-xl">Choose Template</h2>
            <p className="text-sm text-muted-foreground">Select a style for your resume</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(80vh-100px)]">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelect(template.id)}
                  className={`template-card ${currentTemplate === template.id ? "selected" : ""}`}
                  data-testid={`template-${template.id}`}
                >
                  {/* Preview */}
                  <div className={`${template.preview} rounded-t-xl h-48 overflow-hidden relative`}>
                    <div className={`${template.headerColor} h-12`} />
                    <div className="p-4 space-y-2">
                      <div className={`h-3 rounded ${template.id === "tech" ? "bg-slate-700" : "bg-slate-200"} w-1/2`} />
                      <div className={`h-2 rounded ${template.id === "tech" ? "bg-slate-800" : "bg-slate-100"} w-full`} />
                      <div className={`h-2 rounded ${template.id === "tech" ? "bg-slate-800" : "bg-slate-100"} w-3/4`} />
                      <div className="pt-2">
                        <div className={`h-2 rounded ${template.id === "tech" ? "bg-slate-700" : "bg-slate-200"} w-1/3 mb-2`} />
                        <div className="flex gap-1">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-4 w-12 rounded ${
                                template.id === "tech" ? "bg-lime-900/50" : "bg-slate-100"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {currentTemplate === template.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 bg-muted/30 rounded-b-xl border-t">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}
