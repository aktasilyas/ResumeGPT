import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Target, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { postJson } from "@/lib/api";

export default function JobOptimizeModal({ cv, onClose, onApply }) {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    if (!jobDescription.trim()) return;

    setLoading(true);
    try {
      const data = await postJson(`/ai/optimize-for-job`, {
        cv_data: cv.data,
        job_description: jobDescription,
      });
      setResult(data);
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="job-optimize-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl">Optimize for Job</h2>
              <p className="text-sm text-muted-foreground">Tailor your CV to a specific job</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(85vh-160px)]">
          <div className="p-6 space-y-6">
            {!result ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Paste the Job Description
                  </label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here to get personalized suggestions..."
                    className="min-h-[200px]"
                    data-testid="job-description-input"
                  />
                </div>

                <Button
                  onClick={handleOptimize}
                  disabled={loading || !jobDescription.trim()}
                  className="w-full"
                  data-testid="optimize-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Optimize My CV
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                {/* Match Percentage */}
                <div className="text-center">
                  <div className={`text-5xl font-bold ${
                    result.match_percentage >= 70 ? "text-emerald-600" :
                    result.match_percentage >= 50 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {result.match_percentage}%
                  </div>
                  <p className="text-muted-foreground mt-1">Match Score</p>
                </div>

                {/* Matched Keywords */}
                {result.matched_keywords?.length > 0 && (
                  <div>
                    <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Matched Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                        >
                          ✓ {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {result.missing_keywords?.length > 0 && (
                  <div>
                    <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                        >
                          + {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {result.suggestions?.length > 0 && (
                  <div>
                    <h3 className="font-heading font-semibold mb-3">Suggestions</h3>
                    <ul className="space-y-3">
                      {result.suggestions.map((suggestion, i) => (
                        <li key={i} className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            {suggestion.section}
                          </p>
                          <p className="text-sm">{suggestion.suggestion}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Optimized Summary */}
                {result.optimized_summary && (
                  <div>
                    <h3 className="font-heading font-semibold mb-3">Optimized Summary</h3>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 text-sm">
                      {result.optimized_summary}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setResult(null)} className="flex-1">
                    Try Another Job
                  </Button>
                  <Button
                    onClick={() => onApply(result)}
                    className="flex-1"
                    disabled={!result.optimized_summary}
                  >
                    Apply Suggestions
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}
