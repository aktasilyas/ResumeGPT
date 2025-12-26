# Smart Resume Builder - Product Requirements Document

## Original Problem Statement
Build a modern web-based AI-powered CV builder application similar to Canva + Resume.io, enhanced with AI analysis and smart suggestions.

## User Choices (Iteration 2)
- **AI Provider**: Google Gemini via Emergent LLM key
- **Authentication**: Email/Password + Emergent-managed Google OAuth
- **Design**: Light mode primary with dark mode toggle
- **Data Persistence**: User-based persistence with MongoDB
- **PDF**: Free users have watermark, Pro users get watermark-free
- **Language**: Turkish/English with auto-detection
- **Premium**: $4.99/month subscription via Stripe

## User Personas
1. **Job Seekers**: Looking to create professional resumes quickly
2. **Career Changers**: Need AI help to optimize CVs for new industries
3. **Students/Graduates**: First-time resume creators needing guidance
4. **Turkish Users**: Native speakers wanting UI in their language

## Architecture

### Tech Stack
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: Google Gemini via emergentintegrations library
- **PDF**: WeasyPrint
- **Auth**: Email/Password + Emergent Google OAuth
- **Payments**: Stripe Checkout

## What's Been Implemented (Dec 2025)

### Backend
- [x] FastAPI server with all CRUD endpoints
- [x] MongoDB integration for users, sessions, CVs, payments
- [x] Email/Password registration and login with bcrypt
- [x] Google OAuth via Emergent Auth
- [x] Stripe Checkout subscription integration
- [x] AI endpoints: analyze, improve, optimize-for-job, suggest-skills
- [x] PDF generation with WeasyPrint

### Frontend
- [x] Landing page with professional design (responsive)
- [x] Turkish/English language support with auto-detection
- [x] Auth page with Email/Password + Google OAuth
- [x] AuthProvider context for session management
- [x] Protected routes with authentication
- [x] Dashboard with CV cards
- [x] CV Editor with 8 wizard steps
- [x] Live CV preview
- [x] AI Analysis panel with scoring
- [x] Job optimization modal
- [x] 4 templates (2 free, 2 premium)
- [x] Premium upgrade flow with Stripe
- [x] Dark/Light mode toggle
- [x] Autosave functionality
- [x] Mobile responsive design

### Premium Features
- [x] Premium template badges
- [x] Upgrade to Premium modal
- [x] Stripe Checkout integration
- [x] Payment success page
- [x] Pro user detection

## P0/P1/P2 Features Remaining

### P0 (Critical)
- All core features implemented ✓

### P1 (Important)
- [ ] Drag & drop section reordering
- [ ] Photo upload for CV
- [ ] More template variations
- [ ] Annual subscription option ($39/year)

### P2 (Nice to Have)
- [ ] CV version history
- [ ] Export to Word/LinkedIn
- [ ] Cover letter generation
- [ ] Interview prep based on CV

## Next Action Items
1. Add drag & drop for CV sections
2. Implement photo upload
3. Add annual subscription option
4. Create more template variations
5. Add more languages (German, French, Spanish)
