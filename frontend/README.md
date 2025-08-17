# MyBuddy Frontend

A React Native (Expo + TypeScript) application that provides a cross-platform interface for the MyBuddy system, supporting web, Android, and iOS platforms.

## 🚀 Features

- **Cross-Platform Support**: Web, Android, and iOS
- **TypeScript**: Full type safety and better development experience
- **Role-Based Profiles**: Admin, Standard Plus, Standard, Child, and Guest roles
- **Profile Management**: Create, switch between, and manage multiple profiles
- **Memory System**: Search history, short-term, and long-term memory management
- **LLM Context Adaptation**: Personalized AI responses based on profile data
- **Local Storage**: Profile data stored locally in browser/mobile storage

## 📋 Prerequisites

### Node.js
- **Version**: 20.19.0 (required)
- **Installation**: Download from [nodejs.org](https://nodejs.org/) or use nvm

### Using nvm (Node Version Manager)
```bash
# Install nvm (if not already installed)
# Windows: https://github.com/coreybutler/nvm-windows
# macOS/Linux: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 20.19.0
nvm install 20.19.0
nvm use 20.19.0
```

### Verify Installation
```bash
node --version  # Should show v20.19.0
npm --version   # Should show 9.x.x or higher
```

## 🛠️ Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm list --depth=0
   ```

## 🚀 Running the Application

### Web Development (Recommended for testing)

1. **Start webpack development server**
   ```bash
   npm run webpack
   ```

2. **Open in browser**
   - Navigate to: `http://localhost:19006/`
   - The application will automatically reload on code changes

### Mobile Development

#### Android
1. **Install Android Studio** and Android SDK
2. **Set up Android emulator** or connect physical device
3. **Start Expo development server**
   ```bash
   npx expo start
   ```
4. **Press 'a'** in terminal to open Android

#### iOS (macOS only)
1. **Install Xcode** from Mac App Store
2. **Install iOS Simulator**
3. **Start Expo development server**
   ```bash
   npx expo start
   ```
4. **Press 'i'** in terminal to open iOS Simulator

## 📱 Available Scripts

```bash
# Web development
npm run webpack          # Start webpack dev server
npm run build:web        # Build for production

# Expo development
npx expo start          # Start Expo development server
npx expo start --web    # Start with web support
npx expo start --ios    # Start with iOS support
npx expo start --android # Start with Android support

# Build commands
npx expo build:web      # Build web version
npx expo build:android  # Build Android APK
npx expo build:ios      # Build iOS app (requires Apple Developer account)
```

## 🏗️ Project Structure

```
frontend/
├── app/                    # Main application components
│   ├── index.tsx          # Main entry point
│   ├── dashboard/          # Dashboard screens
│   └── profile/           # Profile management screens
├── components/             # Reusable UI components
├── services/              # API and business logic services
├── types/                 # TypeScript type definitions
├── context/               # React context providers
├── utils/                 # Utility functions
├── webpack.config.js      # Webpack configuration for web
├── index.html             # HTML entry point for web
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## 🔧 Configuration

### Webpack Configuration
- **Entry Point**: `./app/index.tsx`
- **Output**: `bundle.js` in `dist/` folder
- **Development Server**: `http://localhost:19006/`
- **Hot Module Replacement**: Enabled
- **Source Maps**: Enabled for debugging

### TypeScript Configuration
- **Target**: ES2020
- **Module**: ESNext
- **JSX**: React
- **Strict Mode**: Enabled

## 🧪 Testing

### Manual Testing
1. **Profile Creation**: Test creating profiles with different roles
2. **Profile Switching**: Verify profile selection and switching works
3. **Memory Management**: Test memory reset and search entry addition
4. **Cross-Platform**: Test on web, Android, and iOS

### Browser Testing
- **Chrome**: Primary development browser
- **Firefox**: Cross-browser compatibility
- **Safari**: iOS web compatibility
- **Edge**: Windows compatibility

## 🐛 Troubleshooting

### Common Issues

#### "npm error enoent Could not read package.json"
- **Solution**: Ensure you're in the `frontend` directory
- **Command**: `cd frontend` then `npm run webpack`

#### "Module not found" errors
- **Solution**: Reinstall dependencies
- **Command**: `rm -rf node_modules package-lock.json && npm install`

#### Webpack server not starting
- **Solution**: Check if port 19006 is available
- **Alternative**: Use `npm run webpack -- --port 3000`

#### TypeScript compilation errors
- **Solution**: Check type definitions and imports
- **Command**: `npx tsc --noEmit`

### Performance Issues
- **Web**: Check browser console for errors
- **Mobile**: Use Expo DevTools for debugging
- **Memory**: Monitor localStorage usage in browser

## 📚 Dependencies

### Core Dependencies
- **React**: 18.2.0
- **React Native**: 0.72.6
- **Expo**: 49.0.0
- **TypeScript**: 5.1.6

### Development Dependencies
- **Webpack**: 5.88.2
- **Babel**: 7.22.0
- **HTML Webpack Plugin**: 5.5.3

### UI Dependencies
- **React Native Web**: 0.19.6
- **React DOM**: 18.2.0

## 🔄 Updates and Maintenance

### Updating Dependencies
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update specific package
npm install package-name@latest
```

### Clearing Cache
```bash
# Clear npm cache
npm cache clean --force

# Clear Expo cache
npx expo r -c

# Clear webpack cache
rm -rf node_modules/.cache
```

## 📞 Support

For issues related to:
- **Frontend Setup**: Check this README and troubleshooting section
- **Backend Integration**: See `../backend/README.md`
- **General Issues**: Check the main project README

## 🚀 Next Steps

After setting up the frontend:
1. **Test the application** on web platform
2. **Create test profiles** to verify functionality
3. **Set up backend** (see `../backend/README.md`)
4. **Configure API endpoints** in `services/api.ts`
5. **Test cross-platform compatibility**

---

**Happy Coding! 🎉**
