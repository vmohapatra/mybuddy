# MyBuddy - AI-Powered Personal Assistant App

A monorepo containing a Spring Boot Kotlin backend and React Native frontend for creating personalized AI buddies with unique personalities and capabilities.

## 🚀 Features

- **Personalized AI Buddies**: Create custom AI assistants with unique personalities
- **Role-Based Profiles**: Admin, Standard Plus, Standard, Child, and Guest roles with different capabilities
- **Profile Management**: Create, switch between, and manage multiple profiles seamlessly
- **Memory System**: Comprehensive search history, short-term, and long-term memory management
- **LLM Context Adaptation**: Personalized AI responses based on profile-specific data and rules
- **Multi-Device Support**: Up to 3 buddies per device
- **Interactive Features**: Chat, Search, Games, History tracking, Memory Management
- **Context-Aware**: Buddies remember conversations and adapt to your style
- **Cross-Platform**: React Native app works on iOS and Android

## 🏗️ Architecture

```
mybuddy/
├── backend/          # Spring Boot Kotlin API
├── frontend/         # React Native Expo app
└── shared/           # Shared types and documentation
```

### Backend (Spring Boot + Kotlin)
- **RESTful APIs** for profiles, chat, search, games
- **JPA/Hibernate** for data persistence
- **Spring AI** integration with OpenAI
- **Security** with CORS configuration
- **H2/PostgreSQL** database support

### Frontend (React Native + Expo)
- **Expo Router** for navigation
- **TypeScript** for type safety
- **AsyncStorage** for local data
- **Axios** for API communication
- **Modern UI** with native components

## 🛠️ Tech Stack

### Backend
- **Language**: Kotlin
- **Framework**: Spring Boot 3.2.0
- **Database**: H2 (dev) / PostgreSQL (prod)
- **AI**: Spring AI + OpenAI
- **Build**: Gradle
- **Java**: 17+

### Frontend
- **Framework**: React Native
- **Runtime**: Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State**: React Context + Hooks
- **Storage**: AsyncStorage

## 📋 Prerequisites

- **Java 17+**
- **Node.js 20.19.0** (required for Expo SDK 49 compatibility)
- **Expo CLI**
- **Docker** (optional, for containerized development)
- **OpenAI API Key**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/mybuddy.git
cd mybuddy
```

### 2. Backend Setup
```bash
cd backend

# Set OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Run with Gradle
./gradlew bootRun

# Or build and run JAR
./gradlew build
java -jar build/libs/mybuddy-backend-0.0.1-SNAPSHOT.jar
```

📖 **Detailed Backend Setup**: See [backend/README.md](backend/README.md) for comprehensive backend setup instructions.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start webpack development server (recommended for testing)
npm run webpack

# Or start Expo development server
npm start

# Run on device/emulator
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

📖 **Detailed Frontend Setup**: See [frontend/README.md](frontend/README.md) for comprehensive frontend setup instructions.

### 4. Database Setup
The app uses H2 in-memory database by default. For production:

```bash
# Update application.yml with PostgreSQL credentials
# Or use Docker Compose
docker-compose up postgres
```

## 🐳 Docker Development

```bash
# Start all services
docker-compose up

# Start specific service
docker-compose up postgres redis

# View logs
docker-compose logs -f backend
```

## 📱 App Flow

1. **Welcome Screen**: Select existing buddy or create new one
2. **Profile Creation**: Set buddy name, email, and role assignment
3. **Profile Management**: Switch between profiles with the new Profile Selector
4. **Dashboard**: Choose from Search, Chat, Games, History, or Reset Learning
5. **Feature Screens**: Interact with your AI buddy
6. **Context Persistence**: Buddies remember your preferences and adapt responses

### 🆕 New Profile Selection System
- **Interactive Profile Selector**: Beautiful cards for each profile
- **Switch To Button**: Actually switch between profiles (not just view)
- **Profile Information Display**: Role, email, context, and memory stats
- **Quick Access to Details**: Manage profile settings and memory
- **Seamless Navigation**: Easy switching between different buddy profiles

## 🔧 Configuration

### Backend Configuration
- `backend/resources/application.yml` - Main configuration
- `OPENAI_API_KEY` - Set your OpenAI API key
- Database settings for H2/PostgreSQL

### Frontend Configuration
- `frontend/services/api.ts` - API endpoint configuration
- Environment-based base URLs (dev/prod)

## 📊 API Endpoints

### Profiles
- `POST /api/profiles` - Create new buddy profile
- `GET /api/profiles` - Get profiles by email/device
- `GET /api/profiles/{id}` - Get specific profile
- `DELETE /api/profiles/{id}` - Delete profile

### Chat
- `POST /api/chat/send` - Send message to buddy
- `GET /api/chat/history/{profileId}` - Get chat history

### Search & Games
- Additional endpoints for search and game functionality

## 🧪 Testing

### Backend Tests
```bash
cd backend
./gradlew test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
./gradlew build -x test
```

### Frontend
```bash
cd frontend
expo build:android  # Android APK
expo build:ios      # iOS IPA
```

## 🔒 Security Features

- **CORS Configuration** for cross-origin requests
- **Input Validation** on all API endpoints
- **Device Limits** (max 3 profiles per device)
- **Profile Isolation** by email and device ID

## 📈 Performance

- **Database Indexing** on frequently queried fields
- **Connection Pooling** with HikariCP
- **Async Processing** for AI responses
- **Local Storage** for offline capability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/mybuddy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/mybuddy/discussions)
- **Documentation**: Check the `shared/docs/` folder

## 🗺️ Roadmap

- [ ] **Voice Integration** - Speech-to-text and text-to-speech
- [ ] **Image Recognition** - Visual search and analysis
- [ ] **Multi-Language Support** - Internationalization
- [ ] **Advanced Analytics** - Usage insights and patterns
- [ ] **Social Features** - Share and discover buddy personalities
- [ ] **Offline Mode** - Enhanced local AI capabilities

## 🙏 Acknowledgments

- **Spring Boot** team for the excellent framework
- **Expo** team for React Native tooling
- **OpenAI** for AI capabilities
- **Community** contributors and feedback

---

**Made with ❤️ for AI-powered personal assistance**