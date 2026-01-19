import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const LanguageToggle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEnglish = location.pathname.startsWith("/en");
  
  const toggleLanguage = () => {
    if (isEnglish) {
      // Switch to Arabic
      if (location.pathname === "/en/results") {
        navigate("/results", { state: location.state });
      } else {
        navigate("/");
      }
    } else {
      // Switch to English
      if (location.pathname === "/results") {
        navigate("/en/results", { state: location.state });
      } else {
        navigate("/en");
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="fixed top-4 left-4 z-50 gap-2 bg-background/80 backdrop-blur-sm border-border shadow-md hover:bg-accent"
    >
      <Globe className="h-4 w-4" />
      {isEnglish ? "العربية" : "English"}
    </Button>
  );
};

export default LanguageToggle;
