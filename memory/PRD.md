# Smart Resume Builder - Product Requirements Document

## Original Problem Statement
Build a modern web-based AI-powered CV builder application similar to Canva + Resume.io, enhanced with AI analysis and smart suggestions. Features include:
- Wizard-based CV creation
- Real-time preview
- AI-powered CV analysis with scoring
- Smart suggestions for rewrites
- Job description optimization
- Multiple templates
- PDF export

## User Choices
- **AI Provider**: Google Gemini via Emergent LLM key
- **Authentication**: Emergent-managed Google social login
- **Design**: Light mode primary with dark mode toggle
- **Data Persistence**: User-based persistence with MongoDB
- **PDF**: Free users have watermark, Pro users get watermark-free

## User Personas
1. **Job Seekers**: Looking to create professional resumes quickly
2. **Career Changers**: Need AI help to optimize CVs for new industries
3. **Students/Graduates**: First-time resume creators needing guidance

## Architecture

### Tech Stack
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: Google Gemini via emergentintegrations library
- **PDF**: WeasyPrint
- **Auth**: Emergent Google OAuth

### Key Components
- Landing page with hero, features, CTA
- Dashboard for CV management
- CV Editor with wizard steps + live preview
- AI Analysis panel with scoring
- Job optimization modal
- Template selector
- PDF export

## What's Been Implemented (Dec 2025)

### Backend
- [x] FastAPI server with all CRUD endpoints
- [x] MongoDB integration for users, sessions, CVs
- [x] Google OAuth via Emergent Auth
- [x] AI endpoints: analyze, improve, optimize-for-job, suggest-skills
- [x] PDF generation with WeasyPrint

### Frontend
- [x] Landing page with professional design
- [x] Google OAuth login flow
- [x] Protected routes with session management
- [x] Dashboard with CV cards
- [x] CV Editor with 8 wizard steps
- [x] Live CV preview
- [x] AI Analysis panel with scoring
- [x] Job optimization modal
- [x] 4 templates (Minimal, Corporate, Creative, Tech)
- [x] Dark/Light mode toggle
- [x] Autosave functionality

### AI Features
- [x] CV analysis with overall score (0-100)
- [x] Breakdown scores for content, formatting, keywords, ATS
- [x] Strengths and weaknesses identification
- [x] Missing keywords detection
- [x] Section improvement with AI rewriting
- [x] Job description matching
- [x] Skill suggestions based on job title

## P0/P1/P2 Features Remaining

### P0 (Critical)
- All core features implemented

### P1 (Important)
- [ ] Drag & drop section reordering
- [ ] More template variations
- [ ] Custom color picker for templates
- [ ] Photo upload for CV

### P2 (Nice to Have)
- [ ] CV version history
- [ ] Export to Word/LinkedIn
- [ ] Multiple language support
- [ ] Cover letter generation
- [ ] Interview prep based on CV

## Next Action Items
1. Test Google OAuth end-to-end with real users
2. Add drag & drop functionality for sections
3. Implement photo upload
4. Add more template variations
5. Consider pro user features (watermark removal, more templates)
