import { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    // Navigation
    "nav.getStarted": "Get Started",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Sign Out",
    
    // Landing Page
    "landing.badge": "Powered by AI",
    "landing.title": "Build Your Perfect",
    "landing.titleHighlight": "Resume in Minutes",
    "landing.subtitle": "Create professional, ATS-optimized resumes with AI-powered analysis. Stand out from the crowd and land your dream job.",
    "landing.cta": "Create Your Resume",
    "landing.viewTemplates": "View Templates",
    "landing.freeToStart": "Free to start",
    "landing.noCredit": "No credit card",
    "landing.aiPowered": "AI-powered",
    "landing.featuresTitle": "Everything You Need to Succeed",
    "landing.featuresSubtitle": "Powerful features designed to help you create the perfect resume",
    "landing.howItWorks": "How It Works",
    "landing.howItWorksSubtitle": "Three simple steps to your perfect resume",
    "landing.step1Title": "Enter Your Info",
    "landing.step1Desc": "Fill in your details using our intuitive wizard interface",
    "landing.step2Title": "AI Analysis",
    "landing.step2Desc": "Get instant feedback and suggestions to improve your resume",
    "landing.step3Title": "Download PDF",
    "landing.step3Desc": "Export your polished resume ready for applications",
    "landing.ctaTitle": "Ready to Land Your Dream Job?",
    "landing.ctaSubtitle": "Join thousands of professionals who have improved their careers with SmartResume.",
    "landing.ctaButton": "Start Building for Free",
    
    // Features
    "feature.aiAnalysis": "AI-Powered Analysis",
    "feature.aiAnalysisDesc": "Get instant feedback on your CV with AI scoring and suggestions for improvement.",
    "feature.jobOptimization": "Job Optimization",
    "feature.jobOptimizationDesc": "Tailor your resume for specific job descriptions and increase your match rate.",
    "feature.templates": "Professional Templates",
    "feature.templatesDesc": "Choose from modern, ATS-friendly templates designed by career experts.",
    "feature.pdfExport": "PDF Export",
    "feature.pdfExportDesc": "Download your resume as a pixel-perfect PDF ready for applications.",
    "feature.smartSuggestions": "Smart Suggestions",
    "feature.smartSuggestionsDesc": "AI rewrites weak descriptions and suggests stronger action verbs.",
    "feature.atsCompatible": "ATS Compatible",
    "feature.atsCompatibleDesc": "Ensure your resume passes Applicant Tracking Systems every time.",
    
    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Full Name",
    "auth.loginButton": "Login",
    "auth.signupButton": "Create Account",
    "auth.orContinueWith": "Or continue with",
    "auth.googleLogin": "Continue with Google",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.forgotPassword": "Forgot password?",
    
    // Dashboard
    "dashboard.title": "My Resumes",
    "dashboard.subtitle": "Create, edit, and manage your professional resumes",
    "dashboard.newResume": "New Resume",
    "dashboard.noResumes": "No resumes yet",
    "dashboard.noResumesDesc": "Create your first AI-powered resume to get started",
    "dashboard.createResume": "Create Resume",
    "dashboard.edit": "Edit",
    "dashboard.delete": "Delete",
    "dashboard.download": "Download PDF",
    "dashboard.aiReady": "AI Ready",
    "dashboard.updated": "Updated",
    "dashboard.resumeTitle": "Resume Title",
    "dashboard.create": "Create",
    "dashboard.cancel": "Cancel",
    
    // Editor
    "editor.back": "Back",
    "editor.saved": "Saved",
    "editor.saving": "Saving...",
    "editor.templates": "Templates",
    "editor.optimizeForJob": "Optimize for Job",
    "editor.aiAnalysis": "AI Analysis",
    "editor.downloadPdf": "Download PDF",
    "editor.livePreview": "Live Preview",
    "editor.cvSections": "CV Sections",
    
    // Editor Steps
    "step.personal": "Personal Info",
    "step.summary": "Summary",
    "step.experience": "Experience",
    "step.education": "Education",
    "step.skills": "Skills",
    "step.languages": "Languages",
    "step.certificates": "Certificates",
    "step.projects": "Projects",
    
    // Personal Info
    "personal.title": "Personal Information",
    "personal.subtitle": "Add your contact details",
    "personal.fullName": "Full Name",
    "personal.email": "Email",
    "personal.phone": "Phone",
    "personal.location": "Location",
    "personal.linkedin": "LinkedIn",
    "personal.website": "Website / Portfolio",
    
    // Summary
    "summary.title": "Professional Summary",
    "summary.subtitle": "Write a compelling summary of your experience",
    "summary.improveWithAi": "Improve with AI",
    "summary.placeholder": "Results-driven software engineer with 5+ years of experience...",
    
    // Experience
    "experience.title": "Work Experience",
    "experience.subtitle": "Add your professional experience",
    "experience.add": "Add Experience",
    "experience.position": "Position",
    "experience.company": "Company",
    "experience.startDate": "Start Date",
    "experience.endDate": "End Date",
    "experience.description": "Description",
    "experience.aiImprove": "AI Improve",
    "experience.noItems": "No experiences added yet. Click \"Add Experience\" to get started.",
    
    // Education
    "education.title": "Education",
    "education.subtitle": "Add your educational background",
    "education.add": "Add Education",
    "education.institution": "Institution",
    "education.degree": "Degree",
    "education.field": "Field of Study",
    "education.noItems": "No education added yet. Click \"Add Education\" to get started.",
    
    // Skills
    "skills.title": "Skills",
    "skills.subtitle": "Add your technical and soft skills",
    "skills.add": "Add Skill",
    "skills.noItems": "No skills added yet. Click \"Add Skill\" to get started.",
    "skills.beginner": "Beginner",
    "skills.intermediate": "Intermediate",
    "skills.advanced": "Advanced",
    "skills.expert": "Expert",
    "skills.technical": "Technical",
    "skills.soft": "Soft",
    
    // Languages
    "languages.title": "Languages",
    "languages.subtitle": "Add languages you speak",
    "languages.add": "Add Language",
    "languages.noItems": "No languages added yet. Click \"Add Language\" to get started.",
    "languages.native": "Native",
    "languages.fluent": "Fluent",
    "languages.professional": "Professional",
    "languages.basic": "Basic",
    
    // Certificates
    "certificates.title": "Certificates",
    "certificates.subtitle": "Add your certifications",
    "certificates.add": "Add Certificate",
    "certificates.name": "Certificate Name",
    "certificates.issuer": "Issuer",
    "certificates.date": "Date",
    "certificates.noItems": "No certificates added yet. Click \"Add Certificate\" to get started.",
    
    // Projects
    "projects.title": "Projects",
    "projects.subtitle": "Showcase your personal projects",
    "projects.add": "Add Project",
    "projects.name": "Project Name",
    "projects.url": "URL",
    "projects.description": "Description",
    "projects.noItems": "No projects added yet. Click \"Add Project\" to get started.",
    
    // AI Analysis
    "ai.analysisTitle": "AI Resume Analysis",
    "ai.analysisSubtitle": "Get feedback on your CV",
    "ai.readyToAnalyze": "Ready to Analyze Your CV",
    "ai.readyDesc": "Our AI will score your resume and provide actionable suggestions to improve it.",
    "ai.startAnalysis": "Start Analysis",
    "ai.analyzing": "Analyzing your resume...",
    "ai.overallScore": "Overall Score",
    "ai.strengths": "Strengths",
    "ai.areasToImprove": "Areas to Improve",
    "ai.missingKeywords": "Missing Keywords",
    "ai.recommendations": "Recommendations",
    "ai.reAnalyze": "Re-analyze",
    
    // Job Optimization
    "job.title": "Optimize for Job",
    "job.subtitle": "Tailor your CV to a specific job",
    "job.pasteDescription": "Paste the Job Description",
    "job.placeholder": "Paste the job description here to get personalized suggestions...",
    "job.optimize": "Optimize My CV",
    "job.matchScore": "Match Score",
    "job.matchedKeywords": "Matched Keywords",
    "job.missingKeywords": "Missing Keywords",
    "job.suggestions": "Suggestions",
    "job.optimizedSummary": "Optimized Summary",
    "job.tryAnother": "Try Another Job",
    "job.applySuggestions": "Apply Suggestions",
    
    // Templates
    "templates.title": "Choose Template",
    "templates.subtitle": "Select a style for your resume",
    "templates.minimal": "Minimal",
    "templates.minimalDesc": "Clean and simple design",
    "templates.corporate": "Corporate",
    "templates.corporateDesc": "Professional business style",
    "templates.creative": "Creative",
    "templates.creativeDesc": "Modern with color accents",
    "templates.tech": "Tech",
    "templates.techDesc": "Dark theme for developers",
    "templates.premium": "Premium",
    "templates.unlockPremium": "Unlock Premium Templates",
    
    // Premium/Subscription
    "premium.title": "Upgrade to Premium",
    "premium.subtitle": "Unlock all features and templates",
    "premium.price": "$4.99/month",
    "premium.feature1": "All premium templates",
    "premium.feature2": "No watermark on PDFs",
    "premium.feature3": "Priority AI analysis",
    "premium.feature4": "Unlimited CVs",
    "premium.subscribe": "Subscribe Now",
    "premium.currentPlan": "Current Plan",
    "premium.free": "Free",
    "premium.pro": "Pro",
    
    // Payment
    "payment.success": "Payment Successful!",
    "payment.successDesc": "Thank you for subscribing. You now have access to all premium features.",
    "payment.goToDashboard": "Go to Dashboard",
    "payment.processing": "Processing payment...",
    
    // Share
    "share.title": "Share Resume",
    "share.subtitle": "Create a public link to share your resume",
    "share.generate": "Generate Share Link",
    "share.copy": "Copy Link",
    "share.copied": "Link copied!",
    "share.delete": "Delete Link",
    "share.expires": "Expires",
    "share.views": "Views",
    "share.premiumRequired": "Premium subscription required to share",
    "share.linkActive": "Share link is active",
    "share.publicView": "Public Resume",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.tryAgain": "Try Again",
    "common.close": "Close",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.present": "Present",
  },
  tr: {
    // Navigation
    "nav.getStarted": "Başla",
    "nav.login": "Giriş Yap",
    "nav.signup": "Üye Ol",
    "nav.dashboard": "Panel",
    "nav.logout": "Çıkış Yap",
    
    // Landing Page
    "landing.badge": "Yapay Zeka Destekli",
    "landing.title": "Mükemmel Özgeçmişini",
    "landing.titleHighlight": "Dakikalar İçinde Oluştur",
    "landing.subtitle": "Yapay zeka destekli analiz ile profesyonel, ATS uyumlu özgeçmişler oluşturun. Kalabalıktan sıyrılın ve hayalinizdeki işe kavuşun.",
    "landing.cta": "Özgeçmişini Oluştur",
    "landing.viewTemplates": "Şablonları Gör",
    "landing.freeToStart": "Ücretsiz başla",
    "landing.noCredit": "Kredi kartı gerekmez",
    "landing.aiPowered": "Yapay zeka destekli",
    "landing.featuresTitle": "Başarı İçin İhtiyacınız Olan Her Şey",
    "landing.featuresSubtitle": "Mükemmel özgeçmişi oluşturmanıza yardımcı olacak güçlü özellikler",
    "landing.howItWorks": "Nasıl Çalışır",
    "landing.howItWorksSubtitle": "Mükemmel özgeçmişiniz için üç basit adım",
    "landing.step1Title": "Bilgilerinizi Girin",
    "landing.step1Desc": "Sezgisel sihirbaz arayüzümüzü kullanarak bilgilerinizi doldurun",
    "landing.step2Title": "Yapay Zeka Analizi",
    "landing.step2Desc": "Özgeçmişinizi geliştirmek için anında geri bildirim ve öneriler alın",
    "landing.step3Title": "PDF İndir",
    "landing.step3Desc": "Başvurulara hazır, cilalı özgeçmişinizi dışa aktarın",
    "landing.ctaTitle": "Hayalinizdeki İşe Hazır mısınız?",
    "landing.ctaSubtitle": "SmartResume ile kariyerlerini geliştiren binlerce profesyonele katılın.",
    "landing.ctaButton": "Ücretsiz Başla",
    
    // Features
    "feature.aiAnalysis": "Yapay Zeka Analizi",
    "feature.aiAnalysisDesc": "Yapay zeka puanlaması ve iyileştirme önerileriyle özgeçmişiniz hakkında anında geri bildirim alın.",
    "feature.jobOptimization": "İş Optimizasyonu",
    "feature.jobOptimizationDesc": "Özgeçmişinizi belirli iş tanımlarına göre uyarlayın ve eşleşme oranınızı artırın.",
    "feature.templates": "Profesyonel Şablonlar",
    "feature.templatesDesc": "Kariyer uzmanları tarafından tasarlanan modern, ATS dostu şablonlar arasından seçim yapın.",
    "feature.pdfExport": "PDF Dışa Aktarma",
    "feature.pdfExportDesc": "Özgeçmişinizi başvurulara hazır, piksel mükemmelliğinde PDF olarak indirin.",
    "feature.smartSuggestions": "Akıllı Öneriler",
    "feature.smartSuggestionsDesc": "Yapay zeka zayıf açıklamaları yeniden yazar ve daha güçlü eylem fiilleri önerir.",
    "feature.atsCompatible": "ATS Uyumlu",
    "feature.atsCompatibleDesc": "Özgeçmişinizin her seferinde Başvuru Takip Sistemlerinden geçmesini sağlayın.",
    
    // Auth
    "auth.login": "Giriş Yap",
    "auth.signup": "Üye Ol",
    "auth.email": "E-posta",
    "auth.password": "Şifre",
    "auth.name": "Ad Soyad",
    "auth.loginButton": "Giriş Yap",
    "auth.signupButton": "Hesap Oluştur",
    "auth.orContinueWith": "Veya şununla devam et",
    "auth.googleLogin": "Google ile Devam Et",
    "auth.noAccount": "Hesabınız yok mu?",
    "auth.hasAccount": "Zaten hesabınız var mı?",
    "auth.forgotPassword": "Şifrenizi mi unuttunuz?",
    
    // Dashboard
    "dashboard.title": "Özgeçmişlerim",
    "dashboard.subtitle": "Profesyonel özgeçmişlerinizi oluşturun, düzenleyin ve yönetin",
    "dashboard.newResume": "Yeni Özgeçmiş",
    "dashboard.noResumes": "Henüz özgeçmiş yok",
    "dashboard.noResumesDesc": "Başlamak için ilk yapay zeka destekli özgeçmişinizi oluşturun",
    "dashboard.createResume": "Özgeçmiş Oluştur",
    "dashboard.edit": "Düzenle",
    "dashboard.delete": "Sil",
    "dashboard.download": "PDF İndir",
    "dashboard.aiReady": "AI Hazır",
    "dashboard.updated": "Güncellendi",
    "dashboard.resumeTitle": "Özgeçmiş Başlığı",
    "dashboard.create": "Oluştur",
    "dashboard.cancel": "İptal",
    
    // Editor
    "editor.back": "Geri",
    "editor.saved": "Kaydedildi",
    "editor.saving": "Kaydediliyor...",
    "editor.templates": "Şablonlar",
    "editor.optimizeForJob": "İş İçin Optimize Et",
    "editor.aiAnalysis": "AI Analizi",
    "editor.downloadPdf": "PDF İndir",
    "editor.livePreview": "Canlı Önizleme",
    "editor.cvSections": "CV Bölümleri",
    
    // Editor Steps
    "step.personal": "Kişisel Bilgiler",
    "step.summary": "Özet",
    "step.experience": "Deneyim",
    "step.education": "Eğitim",
    "step.skills": "Yetenekler",
    "step.languages": "Diller",
    "step.certificates": "Sertifikalar",
    "step.projects": "Projeler",
    
    // Personal Info
    "personal.title": "Kişisel Bilgiler",
    "personal.subtitle": "İletişim bilgilerinizi ekleyin",
    "personal.fullName": "Ad Soyad",
    "personal.email": "E-posta",
    "personal.phone": "Telefon",
    "personal.location": "Konum",
    "personal.linkedin": "LinkedIn",
    "personal.website": "Web Sitesi / Portfolyo",
    
    // Summary
    "summary.title": "Profesyonel Özet",
    "summary.subtitle": "Deneyiminizin etkileyici bir özetini yazın",
    "summary.improveWithAi": "AI ile Geliştir",
    "summary.placeholder": "5+ yıllık deneyime sahip sonuç odaklı yazılım mühendisi...",
    
    // Experience
    "experience.title": "İş Deneyimi",
    "experience.subtitle": "Profesyonel deneyiminizi ekleyin",
    "experience.add": "Deneyim Ekle",
    "experience.position": "Pozisyon",
    "experience.company": "Şirket",
    "experience.startDate": "Başlangıç Tarihi",
    "experience.endDate": "Bitiş Tarihi",
    "experience.description": "Açıklama",
    "experience.aiImprove": "AI Geliştir",
    "experience.noItems": "Henüz deneyim eklenmedi. Başlamak için \"Deneyim Ekle\"ye tıklayın.",
    
    // Education
    "education.title": "Eğitim",
    "education.subtitle": "Eğitim geçmişinizi ekleyin",
    "education.add": "Eğitim Ekle",
    "education.institution": "Kurum",
    "education.degree": "Derece",
    "education.field": "Alan",
    "education.noItems": "Henüz eğitim eklenmedi. Başlamak için \"Eğitim Ekle\"ye tıklayın.",
    
    // Skills
    "skills.title": "Yetenekler",
    "skills.subtitle": "Teknik ve sosyal becerilerinizi ekleyin",
    "skills.add": "Yetenek Ekle",
    "skills.noItems": "Henüz yetenek eklenmedi. Başlamak için \"Yetenek Ekle\"ye tıklayın.",
    "skills.beginner": "Başlangıç",
    "skills.intermediate": "Orta",
    "skills.advanced": "İleri",
    "skills.expert": "Uzman",
    "skills.technical": "Teknik",
    "skills.soft": "Sosyal",
    
    // Languages
    "languages.title": "Diller",
    "languages.subtitle": "Konuştuğunuz dilleri ekleyin",
    "languages.add": "Dil Ekle",
    "languages.noItems": "Henüz dil eklenmedi. Başlamak için \"Dil Ekle\"ye tıklayın.",
    "languages.native": "Anadil",
    "languages.fluent": "Akıcı",
    "languages.professional": "Profesyonel",
    "languages.basic": "Temel",
    
    // Certificates
    "certificates.title": "Sertifikalar",
    "certificates.subtitle": "Sertifikalarınızı ekleyin",
    "certificates.add": "Sertifika Ekle",
    "certificates.name": "Sertifika Adı",
    "certificates.issuer": "Veren Kurum",
    "certificates.date": "Tarih",
    "certificates.noItems": "Henüz sertifika eklenmedi. Başlamak için \"Sertifika Ekle\"ye tıklayın.",
    
    // Projects
    "projects.title": "Projeler",
    "projects.subtitle": "Kişisel projelerinizi sergileyin",
    "projects.add": "Proje Ekle",
    "projects.name": "Proje Adı",
    "projects.url": "URL",
    "projects.description": "Açıklama",
    "projects.noItems": "Henüz proje eklenmedi. Başlamak için \"Proje Ekle\"ye tıklayın.",
    
    // AI Analysis
    "ai.analysisTitle": "AI Özgeçmiş Analizi",
    "ai.analysisSubtitle": "CV'niz hakkında geri bildirim alın",
    "ai.readyToAnalyze": "CV'nizi Analiz Etmeye Hazır",
    "ai.readyDesc": "Yapay zekamız özgeçmişinizi puanlayacak ve geliştirmek için uygulanabilir öneriler sunacak.",
    "ai.startAnalysis": "Analizi Başlat",
    "ai.analyzing": "Özgeçmişiniz analiz ediliyor...",
    "ai.overallScore": "Genel Puan",
    "ai.strengths": "Güçlü Yönler",
    "ai.areasToImprove": "Geliştirilecek Alanlar",
    "ai.missingKeywords": "Eksik Anahtar Kelimeler",
    "ai.recommendations": "Öneriler",
    "ai.reAnalyze": "Yeniden Analiz Et",
    
    // Job Optimization
    "job.title": "İş İçin Optimize Et",
    "job.subtitle": "CV'nizi belirli bir işe göre uyarlayın",
    "job.pasteDescription": "İş Tanımını Yapıştırın",
    "job.placeholder": "Kişiselleştirilmiş öneriler almak için iş tanımını buraya yapıştırın...",
    "job.optimize": "CV'mi Optimize Et",
    "job.matchScore": "Eşleşme Puanı",
    "job.matchedKeywords": "Eşleşen Anahtar Kelimeler",
    "job.missingKeywords": "Eksik Anahtar Kelimeler",
    "job.suggestions": "Öneriler",
    "job.optimizedSummary": "Optimize Edilmiş Özet",
    "job.tryAnother": "Başka Bir İş Dene",
    "job.applySuggestions": "Önerileri Uygula",
    
    // Templates
    "templates.title": "Şablon Seç",
    "templates.subtitle": "Özgeçmişiniz için bir stil seçin",
    "templates.minimal": "Minimal",
    "templates.minimalDesc": "Temiz ve sade tasarım",
    "templates.corporate": "Kurumsal",
    "templates.corporateDesc": "Profesyonel iş tarzı",
    "templates.creative": "Yaratıcı",
    "templates.creativeDesc": "Renk vurgulu modern",
    "templates.tech": "Teknoloji",
    "templates.techDesc": "Geliştiriciler için koyu tema",
    "templates.premium": "Premium",
    "templates.unlockPremium": "Premium Şablonların Kilidini Aç",
    
    // Premium/Subscription
    "premium.title": "Premium'a Yükselt",
    "premium.subtitle": "Tüm özelliklerin ve şablonların kilidini açın",
    "premium.price": "₺149,99/ay",
    "premium.feature1": "Tüm premium şablonlar",
    "premium.feature2": "PDF'lerde filigran yok",
    "premium.feature3": "Öncelikli AI analizi",
    "premium.feature4": "Sınırsız CV",
    "premium.subscribe": "Şimdi Abone Ol",
    "premium.currentPlan": "Mevcut Plan",
    "premium.free": "Ücretsiz",
    "premium.pro": "Pro",
    
    // Payment
    "payment.success": "Ödeme Başarılı!",
    "payment.successDesc": "Abone olduğunuz için teşekkürler. Artık tüm premium özelliklere erişiminiz var.",
    "payment.goToDashboard": "Panele Git",
    "payment.processing": "Ödeme işleniyor...",
    
    // Common
    "common.loading": "Yükleniyor...",
    "common.error": "Bir hata oluştu",
    "common.tryAgain": "Tekrar Dene",
    "common.close": "Kapat",
    "common.save": "Kaydet",
    "common.delete": "Sil",
    "common.edit": "Düzenle",
    "common.cancel": "İptal",
    "common.confirm": "Onayla",
    "common.present": "Devam Ediyor",
  }
};

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem("app-language");
    if (saved) return saved;
    
    // Auto-detect from browser
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith("tr") ? "tr" : "en";
  });

  useEffect(() => {
    localStorage.setItem("app-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
