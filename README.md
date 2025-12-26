# Smart Resume Builder

Professional CV/Resume builder with AI-powered features for optimization and analysis.

## 🚀 Features

- **AI-Powered CV Analysis**: Get intelligent feedback on your resume
- **Job-Specific Optimization**: Tailor your CV to specific job descriptions
- **Multiple Templates**: Professional, modern templates
- **PDF Export**: Generate high-quality PDF resumes
- **Share Links**: Share your CV with a secure public link (Premium)
- **Multi-language Support**: English and Turkish
- **Real-time Preview**: See changes as you edit

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **WeasyPrint** - PDF generation
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI framework
- **React Router v7** - Navigation
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Framer Motion** - Animations

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB 5.0+
- Yarn package manager

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ResumeGPT
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Edit .env and add your credentials
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install

# Create .env file from example
cp .env.example .env

# Edit .env if needed
```

### 4. Start MongoDB

```bash
# Make sure MongoDB is running on localhost:27017
mongod --port 27017
```

### 5. Run the Application

#### Backend (Terminal 1)
```bash
cd backend
.venv\Scripts\activate  # or source .venv/bin/activate
uvicorn server:app --reload --port 8000
```

#### Frontend (Terminal 2)
```bash
cd frontend
yarn start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/docs

## 📁 Project Structure

```
ResumeGPT/
├── backend/
│   ├── app/
│   │   ├── core/           # Core functionality (config, database, security)
│   │   ├── models/         # Pydantic models
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Custom middleware (rate limiting)
│   │   └── utils/          # Utility functions
│   ├── server.py           # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   └── App.js          # Main app component
│   ├── package.json        # Node dependencies
│   └── .env.example        # Environment variables template
└── README.md
```

## 🔒 Security Features

- ✅ **XSS Protection**: HTML sanitization for all user inputs
- ✅ **Rate Limiting**: API abuse prevention
- ✅ **Secure Sessions**: HTTP-only cookies with secure tokens
- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **Input Validation**: Pydantic schema validation
- ✅ **Structured Logging**: JSON logs for monitoring
- ✅ **Error Boundaries**: React error handling

## 🔑 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=resume_gpt_dev
ENV=development
SESSION_SECRET=your-secret-key
GOOGLE_API_KEY=your-google-api-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
STRIPE_API_KEY=your-stripe-key (optional)
EMERGENT_LLM_KEY=your-ai-service-key
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📚 API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## 🧪 Development

### Code Quality

The project follows professional standards:
- Modular architecture (separation of concerns)
- Type hints and validation (Pydantic)
- Async/await patterns
- Error handling with specific exceptions
- Structured logging

### Available Scripts

#### Backend
```bash
# Run server
uvicorn server:app --reload

# Run with custom port
uvicorn server:app --reload --port 8080

# Format code
black .

# Lint code
flake8 .
```

#### Frontend
```bash
# Start development server
yarn start

# Build for production
yarn build

# Run tests
yarn test

# Lint code
yarn lint
```

## 🚀 Deployment

### Backend

1. Set environment variables in production
2. Use a production-grade ASGI server (Uvicorn with Gunicorn)
3. Set up MongoDB Atlas for database
4. Configure CORS for your domain
5. Enable HTTPS

```bash
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend

1. Build the production bundle
```bash
yarn build
```

2. Deploy to a static hosting service (Vercel, Netlify, etc.)
3. Set environment variables for production API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is proprietary software.

## 🐛 Known Issues

- Stripe integration requires configuration for payments
- AI features require EMERGENT_LLM_KEY

## 📞 Support

For issues or questions, please open an issue on GitHub.

## ✨ Recent Updates

### Version 2.0.0 (Latest)

**Security Enhancements:**
- Added HTML sanitization to prevent XSS attacks
- Implemented rate limiting middleware
- Strengthened session token generation
- Added input validation on all endpoints

**Code Quality:**
- Refactored monolithic server.py into modular structure
- Added structured JSON logging
- Improved error handling with specific exceptions
- Added React Error Boundary

**Features:**
- Auto-generated API documentation (Swagger/OpenAPI)
- Enhanced security configurations
- Better development setup with .env.example files

---

Built with ❤️ using FastAPI and React
