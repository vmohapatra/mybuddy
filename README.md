# MyBuddy - AI-Powered Personal Assistant App

A monorepo containing a Spring Boot Kotlin backend and React Native frontend for creating personalized AI buddies with unique personalities and capabilities.

## 🚀 Features

- **Personalized AI Buddies**: Create custom AI assistants with unique personalities
- **Role-Based Profiles (Frontend-only)**: Admin, Regular, Child, Guest
- **Profile Management**: Create, switch between, and manage multiple profiles seamlessly
- **Memory System (Frontend-only)**: Search history managed in localStorage
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
- **RESTful APIs** for search, search preferences, and configuration
- **Spring AI** integration with OpenAI (LLM overview respects tone/audience)
- **Security** with CORS configuration
- **H2/PostgreSQL** database support
- **Maven** build system with wrapper

### Frontend (React Native + Expo)
- **Inline navigation** (router optional)
- **TypeScript** for type safety
- **localStorage** (web) for profile/history
- **Axios** for API communication
- **Modern UI** with native components

## 🛠️ Tech Stack

### Backend
- **Language**: Kotlin
- **Framework**: Spring Boot 3.2.0
- **Database**: H2 (dev) / PostgreSQL (prod)
- **AI**: Spring AI + OpenAI
- **Build**: Maven
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
- **Node.js 20.19.0** (required)
- **Expo CLI**
- **Docker** (optional, for containerized development)
- **OpenAI API Key**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/mybuddy.git
cd mybuddy
```

### 2. Start Both (Windows – recommended)
```powershell
# From repo root
./scripts/all.ps1               # Opens two terminals (backend + frontend)
# or run in one terminal (backend background, frontend foreground)
./scripts/run-all.ps1
```

Notes:
- Frontend dev server runs at `http://localhost:19006/` (webpack-dev-server).
- Backend runs at `http://localhost:8080/api/v1`.
- Health: `http://localhost:8080/api/v1/actuator/health`
- Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`

### 3. Backend Setup (manual)
```bash
cd backend

# Set OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Run with Maven
./mvnw spring-boot:run

# Or build and run JAR
./mvnw clean package
java -jar target/mybuddy-backend-0.0.1-SNAPSHOT.jar
```

📖 **Detailed Backend Setup**: See [backend/README.md](backend/README.md) for comprehensive backend setup instructions.

### 4. Frontend Setup (manual)
```bash
cd frontend

# Install dependencies
npm install

# Start webpack development server (recommended)
npm run webpack               # serves on http://localhost:19006/

# Or start Expo development server
npm start

# Run on device/emulator
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

📖 **Detailed Frontend Setup**: See [frontend/README.md](frontend/README.md) for comprehensive frontend setup instructions.

Dependency notes:
- If install fails on `csp-html-webpack-plugin`, use a valid version:
  ```bash
  npm install csp-html-webpack-plugin@^5.1.0 --save-dev
  ```
- If you see "Module not found: react-markdown", install:
  ```bash
  npm install react-markdown@^9 remark-gfm@^4 --save
  ```

### 4.a Frontend with Yarn

You can run the frontend with Yarn in two ways. Do not mix npm and Yarn in the same workspace.

- Option A: Yarn via Corepack (Yarn 4, default when `packageManager` is set)
  ```bash
  cd frontend
  corepack enable
  corepack prepare yarn@4.9.4 --activate
  yarn --version
  yarn install --immutable
  yarn webpack
  ```

- Option B: Yarn Classic (Yarn 1.x, matches Cloudflare Pages default)
  1) Set the project to use Yarn 1 (one-time):
  ```bash
  # in frontend/package.json set
  #   "packageManager": "yarn@1.22.22"
  ```
  2) Clean npm artifacts and install with Yarn 1:
  ```bash
  cd frontend
  rm -f package-lock.json && rm -rf node_modules
  npm i -g yarn@1.22.22
  yarn --version            # 1.22.22
  yarn install
  yarn webpack
  ```

If you hit network errors with Yarn, try:
```bash
yarn config set registry https://registry.npmjs.org
yarn config set network-timeout 600000
yarn install
```

### 5. Database Setup
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
- Default base URL: `http://localhost:8080/api/v1`
- Adjust if your backend runs on a different host/port

## 📊 API Endpoints (current)

### Config
- `GET/POST /api/v1/config/openai`, `POST /api/v1/config/openai/{enable|disable}`

### Search
- `POST /api/v1/search` (respects SearchPreferences including `tone`, `audience`)
- Preferences helpers: `/api/v1/search/preferences/{default|academic|news|technical}`

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
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
mvn clean package -DskipTests
```

### Frontend
```bash
cd frontend
npm run build
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