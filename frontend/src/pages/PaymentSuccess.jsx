import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { getJson } from "@/lib/api";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      navigate("/dashboard");
      return;
    }

    const pollStatus = async (attempts = 0) => {
      if (attempts >= 5) {
        setStatus("success"); // Assume success after max attempts
        return;
      }

      try {
        const data = await getJson(`/stripe/status/${sessionId}`);
        if (data.payment_status === "paid") {
          setStatus("success");
          return;
        }

        // Continue polling
        setTimeout(() => pollStatus(attempts + 1), 2000);
      } catch (error) {
        console.error("Error checking payment status:", error);
        setTimeout(() => pollStatus(attempts + 1), 2000);
      }
    };

    pollStatus();
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            {status === "loading" ? (
              <>
                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
                <h2 className="font-heading text-xl font-bold mb-2">
                  {t("payment.processing")}
                </h2>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="font-heading text-2xl font-bold mb-2">
                  {t("payment.success")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t("payment.successDesc")}
                </p>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full"
                  data-testid="go-to-dashboard"
                >
                  {t("payment.goToDashboard")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
