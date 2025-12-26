import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageProvider";
import { toast } from "sonner";
import { Share2, Copy, Trash2, Loader2, Crown, Eye, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { getJson, postJson, deleteJson } from "@/lib/api";

export default function ShareModal({ cvId, isPro, onClose }) {
  const { t } = useLanguage();
  const [shareLink, setShareLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchShareLink();
  }, [cvId]);

  const fetchShareLink = async () => {
    try {
      const data = await getJson(`/cvs/${cvId}/share`);
      if (data.share_token) setShareLink(data);
    } catch (error) {
      console.error("Failed to fetch share link:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = async () => {
    setGenerating(true);
    try {
      const data = await postJson(`/cvs/${cvId}/share`);
      setShareLink(data);
      toast.success(t("share.linkActive"));
    } catch (error) {
      if (error.status === 403) {
        toast.error(t("share.premiumRequired"));
      } else {
        console.error("Failed to generate share link:", error);
        toast.error(t("common.error"));
      }
    } finally {
      setGenerating(false);
    }
  };

  const deleteShareLink = async () => {
    try {
      await deleteJson(`/cvs/${cvId}/share`);
      setShareLink(null);
      toast.success(t("common.delete") + " ✓");
    } catch (error) {
      console.error("Failed to delete share link:", error);
      toast.error(t("common.error"));
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/cv/${shareLink.share_token}`;
    navigator.clipboard.writeText(url);
    toast.success(t("share.copied"));
  };

  const shareUrl = shareLink ? `${window.location.origin}/cv/${shareLink.share_token}` : "";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="share-modal">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            {t("share.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !isPro ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t("premium.title")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("share.premiumRequired")}
              </p>
              <Button
                onClick={() => {
                  onClose();
                  // Trigger upgrade modal
                }}
                className="w-full"
              >
                {t("premium.subscribe")}
              </Button>
            </div>
          ) : shareLink ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("share.subtitle")}</p>

              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                  data-testid="share-url"
                />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(shareUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{shareLink.views || 0} {t("share.views")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {t("share.expires")}: {shareLink.expires_at ? format(new Date(shareLink.expires_at), "MMM d, yyyy") : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={deleteShareLink}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("share.delete")}
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("share.subtitle")}
              </p>
              <Button
                onClick={generateShareLink}
                disabled={generating}
                className="w-full"
                data-testid="generate-share-link"
              >
                {generating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t("share.generate")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
