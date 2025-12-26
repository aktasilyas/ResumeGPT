import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";

export default function ProfileMenu({ user, onLogout, showLanguage = true, showTheme = true }) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          )}
          <span className="hidden lg:inline text-foreground">{user?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {showLanguage && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-foreground-muted">
              {t("nav.language") || "Language"}
            </div>
            <DropdownMenuItem onClick={() => setLanguage("en")}>
              🇺🇸 English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("tr")}>
              🇹🇷 Türkçe
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {showTheme && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-foreground-muted">
              {t("nav.theme") || "Theme"}
            </div>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="w-4 h-4 mr-2" />
              {t("nav.light") || "Light"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="w-4 h-4 mr-2" />
              {t("nav.dark") || "Dark"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={onLogout} data-testid="logout-btn">
          <LogOut className="w-4 h-4 mr-2" />
          {t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
