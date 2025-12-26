import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage } from "@/components/LanguageProvider";
import { X, Check, Crown, Lock } from "lucide-react";
import { motion } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TEMPLATES = [
  {
    id: "minimal",
    nameKey: "templates.minimal",
    descKey: "templates.minimalDesc",
    preview: "bg-white",
    headerColor: "bg-white border-b-2 border-primary",
    premium: false,
  },
  {
    id: "corporate",
    nameKey: "templates.corporate",
    descKey: "templates.corporateDesc",
    preview: "bg-white",
    headerColor: "bg-slate-800",
    premium: false,
  },
  {
    id: "creative",
    nameKey: "templates.creative",
    descKey: "templates.creativeDesc",
    preview: "bg-white",
    headerColor: "bg-gradient-to-r from-primary to-emerald-600",
    premium: true,
  },
  {
    id: "tech",
    nameKey: "templates.tech",
    descKey: "templates.techDesc",
    preview: "bg-slate-900",
    headerColor: "bg-slate-900 border-b border-lime-400",
    premium: true,
  },
];

export default function TemplateSelector({ currentTemplate, onSelect, onClose, isPro = false }) {
  const { t } = useLanguage();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPremiumTemplate, setSelectedPremiumTemplate] = useState(null);

  const handleTemplateClick = (template) => {
    if (template.premium && !isPro) {
      setSelectedPremiumTemplate(template);
      setShowPremiumModal(true);
    } else {
      onSelect(template.id);
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
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} data-testid="template-modal">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg sm:text-xl">{t("templates.title")}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("templates.subtitle")}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="h-[calc(80vh-100px)]">
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className={`template-card relative ${currentTemplate === template.id ? "selected" : ""}`}
                    data-testid={`template-${template.id}`}
                  >
                    {/* Premium Badge */}
                    {template.premium && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-amber-500 hover:bg-amber-500 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          {t("templates.premium")}
                        </Badge>
                      </div>
                    )}

                    {/* Lock Icon for Premium */}
                    {template.premium && !isPro && (
                      <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center z-5">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-slate-600" />
                        </div>
                      </div>
                    )}

                    {/* Preview */}
                    <div className={`${template.preview} rounded-t-xl h-40 sm:h-48 overflow-hidden relative`}>
                      <div className={`${template.headerColor} h-10 sm:h-12`} />
                      <div className="p-3 sm:p-4 space-y-2">
                        <div className={`h-2.5 sm:h-3 rounded ${template.id === "tech" ? "bg-slate-700" : "bg-slate-200"} w-1/2`} />
                        <div className={`h-2 rounded ${template.id === "tech" ? "bg-slate-800" : "bg-slate-100"} w-full`} />
                        <div className={`h-2 rounded ${template.id === "tech" ? "bg-slate-800" : "bg-slate-100"} w-3/4`} />
                        <div className="pt-2">
                          <div className={`h-2 rounded ${template.id === "tech" ? "bg-slate-700" : "bg-slate-200"} w-1/3 mb-2`} />
                          <div className="flex gap-1">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`h-3 sm:h-4 w-10 sm:w-12 rounded ${
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
                    <div className="p-3 sm:p-4 bg-muted/30 rounded-b-xl border-t">
                      <h3 className="font-semibold text-sm sm:text-base">{t(template.nameKey)}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{t(template.descKey)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      </div>

      {/* Premium Upgrade Modal */}
      <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              {t("templates.unlockPremium")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground text-sm mb-4">
              {t("premium.subtitle")}
            </p>
            <div className="text-center mb-4">
              <span className="text-3xl font-bold">$4.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPremiumModal(false)} className="w-full sm:w-auto">
              {t("common.cancel")}
            </Button>
            <Button onClick={handleUpgrade} className="w-full sm:w-auto">
              {t("premium.subscribe")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
