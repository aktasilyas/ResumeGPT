import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { X, Sparkles, Loader2, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { postJson } from "@/lib/api";

export default function AIAnalysisPanel({ cv, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeCV = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await postJson(`/ai/analyze`, { cv_data: cv.data });
      setAnalysis(data);
    } catch (err) {
      console.error("AI analysis error:", err);
      setError("Failed to analyze CV. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="ai-analysis-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl">AI Resume Analysis</h2>
              <p className="text-sm text-muted-foreground">Get feedback on your CV</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(80vh-160px)]">
          <div className="p-6">
            {!analysis && !loading && (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  Ready to Analyze Your CV
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Our AI will score your resume and provide actionable suggestions to improve it.
                </p>
                <Button onClick={analyzeCV} className="rounded-full px-8" data-testid="start-analysis-btn">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Analysis
                </Button>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Analyzing your resume...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={analyzeCV} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {analysis && (
              <div className="space-y-8">
                {/* Overall Score */}
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(analysis.overall_score / 100) * 352} 352`}
                        className={getScoreColor(analysis.overall_score)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-4xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                        {analysis.overall_score}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2">Overall Score</p>
                </div>

                {/* Breakdown */}
                {analysis.breakdown && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(analysis.breakdown).map(([key, value]) => (
                      <div key={key} className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className={`font-bold ${getScoreColor(value)}`}>{value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(value)}`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Strengths */}
                {analysis.strengths?.length > 0 && (
                  <div>
                    <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {analysis.weaknesses?.length > 0 && (
                  <div>
                    <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                      Areas to Improve
                    </h3>
                    <ul className="space-y-3">
                      {analysis.weaknesses.map((weakness, i) => (
                        <li key={i} className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
                          <p className="font-medium text-sm text-amber-800 dark:text-amber-200">
                            {weakness.issue}
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            💡 {weakness.suggestion}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Keywords */}
                {analysis.missing_keywords?.length > 0 && (
                  <div>
                    <h3 className="font-heading font-semibold mb-3">Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missing_keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                        >
                          + {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations?.length > 0 && (
                  <div>
                    <h3 className="font-heading font-semibold mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-0.5">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {analysis && (
          <div className="p-4 border-t border-border">
            <Button onClick={analyzeCV} variant="outline" className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Re-analyze
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
