# SignBridge AI - Indian Sign Language Communication Platform

A comprehensive, production-ready web application that eliminates communication barriers between deaf, mute, and hearing people through real-time translation between Indian Sign Language (ISL), spoken language, and text.

## Overview

SignBridge AI is a cutting-edge platform designed to bridge communication gaps using advanced AI technologies. It supports:
- **ISL to Text/Speech Translation**: Real-time sign language recognition
- **Text/Speech to ISL Animation**: Convert spoken language into animated sign language
- **Multilingual Support**: 15+ Indian languages with speech recognition and translation
- **Live Conversation Mode**: Two-way communication between sign and speech
- **Interactive Learning**: ISL alphabet, numbers, sentences, and emergency signs
- **Accessibility Features**: Dark mode, high contrast, screen reader support

## Core Features

### 1. Indian Sign Language → Sentence Translation
- Uses MediaPipe Hands for real-time ISL detection
- Recognizes alphabets, numbers, words, and complete sentences
- NLP-powered sentence formation and grammar correction
- Confidence scoring for accuracy

### 2. English → Animated Indian Sign Language
- 3D Human Avatar with natural sign animation
- Continuous playback with controls (pause, replay, speed, fullscreen)
- Downloadable animations
- Smooth, natural-looking gestures

### 3. Speech → Text
- Real-time speech recognition for 15+ Indian languages
- Continuous listening mode
- High accuracy speech-to-text conversion

### 4. Speech Translation
- Real-time translation between multiple Indian languages
- User-selectable input and output languages
- Context-aware translation

### 5. Speech → Animated Sign Language
- Complete pipeline: Speech → Text → ISL Animation
- Ideal for educational settings and professional communication

### 6. Sign Language → Speech
- Converts detected signs to spoken words
- Natural text-to-speech output
- Supports multiple Indian languages

### 7. Live Conversation Mode
- Two-way communication panels
- Real-time bidirectional translation
- Perfect for face-to-face conversations

### 8. Multilingual Support
- 15+ Indian languages: English, Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Bengali, Urdu, Odia, Assamese, Sanskrit, Konkani, Manipuri, Bodo, Dogri, Maithili, Santali, Kashmiri, Sindhi
- Easily expandable language support

### 9. AI Sentence Correction
- Automatic grammar correction
- Spelling correction
- Punctuation insertion
- Meaningful sentence formation

### 10. Confidence Score
- Real-time accuracy display
- Confidence-based validation
- User guidance for low-confidence detections

### 11. Conversation History
- Date, time, and language tracking
- Detected signs and translations
- Confidence scores
- Export to PDF/CSV
- Search functionality

### 12. Learn ISL
- Interactive learning modules
- Alphabet, numbers, common sentences
- Emergency signs, greetings, food, travel
- Hospital, school, office scenarios
- Quiz mode with progress tracking

### 13. Accessibility Features
- Dark/Light mode
- Large text support
- High contrast mode
- Keyboard navigation
- Screen reader compatibility
- Voice commands

## Technology Stack

### Frontend
- **Framework**: React.js with TypeScript
- **UI Library**: Tailwind CSS
- **Animation**: Framer Motion
- **3D Graphics**: Three.js with @react-three/fiber
- **Avatar/Rig**: @react-three/drei
- **Real-time**: Socket.IO
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Chart.js
- **PDF Generation**: jsPDF

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLAlchemy with PostgreSQL/MySQL
- **Authentication**: JWT with Passlib
- **WebSockets**: FastAPI WebSockets
- **ML Integration**: TensorFlow/PyTorch
- **Translation**: HuggingFace Transformers
- **Speech Recognition**: Vosk or Whisper
- **Text-to-Speech**: Coqui TTS or Google Cloud TTS

### AI/ML Models
- **ISL Recognition**: Custom-trained CNN/RNN models
- **Pose Estimation**: MediaPipe Hands
- **Motion Generation**: Pose-forecasting models
- **Speech Recognition**: Whisper or Vosk
- **Translation**: MarianMT or NLLB
- **Text-to-Speech**: Coqui TTS

## Project Structure

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/          # UI components
│   │   ├── services/            # API services
│   │   ├── store/              # Zustand store
│   │   ├── assets/             # Images, models, etc.
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Helper functions
│   │   └── hooks/             # Custom hooks
│   ├── public/                 # Static assets
│   └── ...
├── backend/
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── routes/            # Route definitions
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── core/              # Core functionality
│   │   ├── ml/               # ML model integration
│   │   └── auth/             # Authentication
│   ├── ml_models/             # Pre-trained models
│   ├── tests/                 # Test files
│   └── ...
├── ml_models/                 # Training scripts and datasets
├── scripts/                   # Deployment and setup scripts
└── ...
```

## Installation and Setup

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- PostgreSQL or MySQL (for database)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m pip install --upgrade pip
```

### Database Setup
```sql
CREATE DATABASE signbridge_ai;
USE signbridge_ai;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    detected_signs TEXT,
    speech TEXT,
    translation TEXT,
    confidence DECIMAL(5,2),
    input_language VARCHAR(20),
    output_language VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Development Workflow

### Phase 1: Core Infrastructure
1. Set up project structure and basic configuration
2. Implement authentication system
3. Create database schema
4. Set up CI/CD pipeline

### Phase 2: Frontend Development
1. Create responsive UI components
2. Implement real-time video streaming
3. Build ISL input panel
4. Create animated avatar component
5. Implement speech input interface

### Phase 3: Backend Development
1. Implement all API endpoints
2. Set up WebSocket server
3. Integrate ML models
4. Implement translation services
5. Create admin dashboard APIs

### Phase 4: ML Model Integration
1. Train ISL recognition model
2. Develop text-to-sign animation model
3. Integrate speech recognition
4. Set up translation models
5. Implement text-to-speech

### Phase 5: Testing and Deployment
1. Write comprehensive tests
2. Performance optimization
3. Docker containerization
4. Cloud deployment
5. Documentation

## Deployment

### Docker Setup
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS frontend
WORKDIR /app
COPY frontend/ .
RUN npm install
RUN npm run build

# Backend Dockerfile
FROM python:3.9-slim AS backend
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/signbridge_ai
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=signbridge_ai
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
```

## Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Integration Testing
- End-to-end conversation testing
- Cross-browser compatibility
- Performance testing
- Accessibility testing

## Documentation

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### User Documentation
- Installation guide
- Feature tutorials
- Accessibility guide
- FAQ

### Developer Documentation
- Architecture overview
- Code standards
- Contribution guidelines
- API reference

## Future Enhancements

### Phase 2 Enhancements
1. Android and iOS mobile apps
2. Offline AI capabilities
3. Cloud deployment options
4. Advanced ML model fine-tuning
5. Real-time video call integration

### Long-term Vision
1. Smart glass integration
2. Government accessibility services
3. Hospital communication systems
4. Educational platform expansion
5. Court and police communication tools
6. Public service kiosks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow code standards
4. Write tests
5. Submit a pull request

## License

This project is licensed under the MIT License.