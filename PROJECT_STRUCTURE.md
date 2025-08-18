# MyBuddy Project Structure

## Overview
MyBuddy is a full-stack application with a Spring Boot backend (Kotlin) and React Native frontend (TypeScript). The project follows a clean architecture with frontend-only profile management and backend search services.

## Root Structure
```
mybuddy/
├── backend/                 # Spring Boot backend (Kotlin)
├── frontend/               # React Native frontend (TypeScript)
├── scripts/                # Cross-platform build and run scripts
├── .gitignore             # Git ignore rules
└── PROJECT_STRUCTURE.md   # This file
```

## Backend Structure (`backend/`)
```
backend/
├── mvnw                    # Maven wrapper script (Unix)
├── mvnw.cmd               # Maven wrapper script (Windows)
├── pom.xml                # Maven project configuration
├── README.md              # Backend documentation
├── REAL_SEARCH_IMPLEMENTATION.md
├── SEARCH_PREFERENCES_GUIDE.md
├── SEARCH_SETUP.md
├── test-config.properties # Test configuration
├── TESTING_GUIDE.md       # Testing documentation
├── .mvn/
│   └── wrapper/           # Maven wrapper files
├── resources/
│   ├── application.yml    # Spring Boot configuration
│   └── schema.sql        # Database schema (if needed)
├── src/
│   ├── main/
│   │   ├── kotlin/com/buddyapp/
│   │   │   ├── BuddyApplication.kt      # Main application class
│   │   │   ├── TestConfidenceScore.kt   # Confidence score testing
│   │   │   ├── config/                  # Configuration classes
│   │   │   │   ├── OpenAiConfig.kt
│   │   │   │   ├── SearchConfig.kt
│   │   │   │   ├── SecurityConfig.kt
│   │   │   │   ├── StartupConfig.kt
│   │   │   │   └── SwaggerConfig.kt
│   │   │   ├── controllers/             # REST API controllers
│   │   │   │   ├── ConfigController.kt
│   │   │   │   ├── SearchController.kt
│   │   │   │   └── SearchPreferencesController.kt
│   │   │   ├── models/dto/              # Data Transfer Objects
│   │   │   │   ├── OpenAiConfigRequest.kt
│   │   │   │   ├── OpenAiConfigResponse.kt
│   │   │   │   ├── SearchFeedbackRequest.kt
│   │   │   │   ├── SearchPreferences.kt
│   │   │   │   ├── SearchRequest.kt
│   │   │   │   └── SearchResponse.kt
│   │   │   └── services/                # Business logic services
│   │   │       ├── ConfigService.kt
│   │   │       ├── LLMService.kt
│   │   │       ├── RealSearchService.kt
│   │   │       ├── SearchPreferencesService.kt
│   │   │       └── SearchService.kt
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── kotlin/com/buddyapp/
│           └── SearchDemo.kt
└── target/                # Compiled classes and build artifacts
```

## Frontend Structure (`frontend/`)
```
frontend/
├── .nvmrc                 # Node.js version specification
├── app.js                 # Main application entry point
├── index.html             # HTML template
├── package.json           # Node.js dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── README.md              # Frontend documentation
├── tsconfig.json          # TypeScript configuration
├── webpack.config.js      # Webpack bundler configuration
├── app/                   # Main application screens
│   ├── index.tsx          # Welcome/Profile creation screen
│   ├── _layout.tsx        # App layout wrapper
│   ├── dashboard/         # Dashboard screens
│   │   ├── index.tsx      # Main dashboard
│   │   ├── ChatScreen.tsx # Chat interface (placeholder)
│   │   ├── GameScreen.tsx # Game interface (placeholder)
│   │   ├── HistoryScreen.tsx # History management
│   │   ├── ResetLearningScreen.tsx # Learning reset
│   │   ├── ResetScreen.tsx # Reset options
│   │   ├── SearchHistoryScreen.tsx # Search history display
│   │   └── SearchScreen.tsx # Main search interface
│   └── profile/           # Profile management screens
│       ├── CreateProfile.tsx # Profile creation
│       ├── ProfileSettings.tsx # Profile settings
│       └── SelectProfile.tsx # Profile selection
├── components/            # Reusable UI components
│   └── SearchPreferencesPanel.tsx # Search filters and preferences
├── services/              # API and business logic services
│   ├── api.ts             # Base API configuration
│   ├── gameService.ts     # Game-related API calls (placeholder)
│   ├── profileService.ts  # Profile management (frontend-only)
│   └── searchService.ts   # Search API integration
└── types/                 # TypeScript type definitions
    └── Profile.ts         # Profile interface and types
```

## Scripts Structure (`scripts/`)
```
scripts/
├── all.ps1                # Windows: Combined build and run script
├── build-all.ps1          # Windows: Build only script
├── run-all.ps1            # Windows: Build and run script
└── run-all.sh             # macOS/Linux: Build and run script
```

## Key Features

### Backend
- **Search Service**: Real-time search with multiple engines (Google, Bing, DuckDuckGo)
- **LLM Integration**: OpenAI integration for AI-powered search summaries
- **Search Preferences**: Configurable search filters and preferences
- **REST API**: Clean REST endpoints for search and configuration
- **Swagger Documentation**: API documentation and testing interface

### Frontend
- **Profile Management**: Local storage-based user profiles with roles and subscriptions
- **Search Interface**: Advanced search with filters and preferences
- **Search History**: Local search history management
- **Role-Based Access**: Different feature access based on user roles
- **Subscription Plans**: Feature limits based on subscription tiers
- **Responsive Design**: Works on web, iOS, and Android

### Architecture Decisions
- **Frontend-Only Profile Management**: User profiles, roles, and subscriptions managed entirely in frontend
- **Backend Search Services**: Search functionality and AI integration handled by backend
- **Local Storage**: User data persisted in browser/device local storage
- **No Database**: Backend doesn't require persistent user data storage
- **Clean Separation**: Clear boundaries between frontend and backend responsibilities

## Technology Stack

### Backend
- **Language**: Kotlin
- **Framework**: Spring Boot
- **Build Tool**: Maven
- **AI Integration**: OpenAI API
- **Search APIs**: Google Custom Search, Bing Search, DuckDuckGo

### Frontend
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Storage**: Local Storage (web) / AsyncStorage (mobile)
- **UI Components**: Custom React Native components
- **Markdown**: react-markdown for content formatting

### Development Tools
- **Package Manager**: npm
- **Bundler**: Webpack
- **Build Scripts**: PowerShell (Windows), Bash (macOS/Linux)
- **Version Control**: Git

## Getting Started

### Prerequisites
- Java 17+ (for backend)
- Node.js 18+ (for frontend)
- Maven (for backend builds)
- npm (for frontend package management)

### Quick Start
1. **Backend**: `cd backend && mvn spring-boot:run`
2. **Frontend**: `cd frontend && npm start`
3. **Or use scripts**: `./scripts/all.ps1` (Windows) or `./scripts/run-all.sh` (macOS/Linux)

### Environment Setup
- Backend runs on port 8080
- Frontend runs on port 19006 (Expo default)
- API keys required for search services and OpenAI integration

## Development Workflow
1. **Backend Changes**: Modify Kotlin files, restart Spring Boot application
2. **Frontend Changes**: Modify TypeScript/TSX files, hot reload via Expo
3. **Testing**: Use provided test scripts and Swagger UI for API testing
4. **Deployment**: Build artifacts generated in respective target/dist directories
