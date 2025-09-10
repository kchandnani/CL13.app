# FNTZ AI Backend Setup Guide

## 🚀 Quick Start Commands

### **1. Initial Setup**
```bash
# Create backend directory
mkdir backend
cd backend

# Setup Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Create basic structure
mkdir app app/models app/routers app/services app/ai app/utils
touch app/__init__.py app/main.py app/models/__init__.py app/routers/__init__.py
```

### **2. Install Dependencies**
```bash
# Core dependencies
pip install fastapi uvicorn python-multipart python-jose[cryptography] passlib[bcrypt]

# Database
pip install psycopg2-binary sqlalchemy alembic

# AI/ML
pip install transformers torch numpy pandas scikit-learn

# Utils
pip install python-dotenv requests redis aioredis

# Save requirements
pip freeze > requirements.txt
```

### **3. Basic FastAPI Setup**
Create `app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FNTZ AI Backend", version="1.0.0")

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "FNTZ AI Backend Running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fntz-ai-backend"}
```

### **4. Run Development Server**
```bash
# From backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🗄️ Database Setup (PostgreSQL)

### **1. Install PostgreSQL**
```bash
# Windows: Download from postgresql.org
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
```

### **2. Create Database**
```sql
-- Connect to PostgreSQL
CREATE DATABASE fntz_ai;
CREATE USER fntz_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fntz_ai TO fntz_user;
```

### **3. Environment Variables**
Create `.env` file in backend root:
```env
DATABASE_URL=postgresql://fntz_user:your_password@localhost:5432/fntz_ai
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development
```

---

## 🤖 AI Model Integration

### **1. Hugging Face Setup**
```python
# app/ai/models.py
from transformers import pipeline

class FantasyAI:
    def __init__(self):
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.text_generator = pipeline("text-generation", model="gpt2")
    
    async def analyze_player(self, player_data: dict) -> dict:
        # Implement player analysis logic
        pass
    
    async def generate_advice(self, question: str) -> str:
        # Implement advice generation
        pass
```

### **2. Connect to Next.js API**
Update `src/app/api/ask/route.ts`:
```typescript
export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()
    
    // Call Python backend
    const response = await fetch('http://localhost:8000/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    })
    
    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Backend connection failed' }, { status: 500 })
  }
}
```

---

## 📊 Database Models

### **User Model**
```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    sleeper_username = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime)
```

### **League Model**
```python
# app/models/league.py
class League(Base):
    __tablename__ = "leagues"
    
    id = Column(Integer, primary_key=True, index=True)
    sleeper_id = Column(String, unique=True, index=True)
    name = Column(String)
    season = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    settings = Column(JSON)
    last_synced = Column(DateTime)
```

---

## 🔗 API Endpoints Structure

### **Authentication Routes**
```python
# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register")
async def register_user(user_data: UserCreate):
    # User registration logic
    pass

@router.post("/login")
async def login_user(form_data: OAuth2PasswordRequestForm):
    # User login logic
    pass

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    # Get user profile
    pass
```

### **AI Routes**
```python
# app/routers/ai.py
@router.post("/ask")
async def ask_ai(question: str):
    # Connect to AI models
    pass

@router.post("/analyze-player")
async def analyze_player(player_id: str):
    # Player analysis
    pass
```

---

## 🧪 Testing Setup

### **1. Install Testing Dependencies**
```bash
pip install pytest pytest-asyncio httpx
```

### **2. Basic Test Structure**
```python
# tests/test_main.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "FNTZ AI Backend Running"}
```

---

## 📦 Deployment Preparation

### **Docker Setup**
```dockerfile
# Dockerfile
FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### **Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://fntz_user:password@db:5432/fntz_ai
    depends_on:
      - db
  
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: fntz_ai
      POSTGRES_USER: fntz_user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🎯 Development Phases

### **Week 1: Foundation**
- [ ] FastAPI server setup
- [ ] Database connection
- [ ] Basic authentication
- [ ] Health check endpoints

### **Week 2: Core Features**
- [ ] User management
- [ ] Sleeper API integration
- [ ] Basic AI endpoints
- [ ] Frontend connection

### **Week 3-4: AI Integration**
- [ ] Hugging Face models
- [ ] Player analysis algorithms
- [ ] Advanced analytics
- [ ] Performance optimization

### **Week 5-6: Advanced Features**
- [ ] Real-time updates
- [ ] Caching system
- [ ] Background tasks
- [ ] Production deployment

---

**🚀 Ready to start backend development! The frontend is complete and waiting for these backend services.** 