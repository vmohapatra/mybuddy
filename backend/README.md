# MyBuddy Backend

A Spring Boot application written in Kotlin that provides RESTful APIs for the MyBuddy system, featuring profile management, role-based access control, and LLM integration.

## 🚀 Features

- **Spring Boot 3.2**: Latest Spring Boot version with Kotlin support
- **JPA/Hibernate**: Database persistence with automatic schema generation
- **Spring Security**: Role-based authentication and authorization
- **Spring AI**: OpenAI integration for LLM responses
- **RESTful APIs**: Clean, documented API endpoints
- **H2 Database**: In-memory database for development
- **PostgreSQL**: Production-ready database support
- **Docker Support**: Containerized deployment ready

## 📋 Prerequisites

### Java Development Kit (JDK)
- **Version**: 17 or higher (required for Spring Boot 3.x)
- **Recommended**: OpenJDK 17 LTS or Oracle JDK 17
- **Installation**: Download from [adoptium.net](https://adoptium.net/) or [oracle.com](https://www.oracle.com/java/technologies/downloads/)

### Verify Java Installation
```bash
java --version    # Should show Java 17 or higher
javac --version   # Should show Java 17 or higher
```

### Gradle (Optional)
- **Version**: 8.0 or higher
- **Note**: Gradle wrapper is included, so manual installation is optional
- **Installation**: Download from [gradle.org](https://gradle.org/install/)

### Verify Gradle Installation
```bash
gradle --version  # Should show Gradle 8.x or higher
```

## 🛠️ Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Verify project structure**
   ```bash
   ls -la
   # Should show: build.gradle.kts, settings.gradle.kts, src/, etc.
   ```

3. **Check Gradle wrapper**
   ```bash
   ./gradlew --version
   # On Windows: gradlew.bat --version
   ```

## 🚀 Running the Application

### Development Mode (Recommended)

1. **Start the application**
   ```bash
   ./gradlew bootRun
   # On Windows: gradlew.bat bootRun
   ```

2. **Verify startup**
   - Look for: "Started BuddyApplication in X.XXX seconds"
   - Application will be available at: `http://localhost:8080`

3. **Check health endpoint**
   ```bash
   curl http://localhost:8080/actuator/health
   # Or visit: http://localhost:8080/actuator/health
   ```

### Production Build

1. **Build the application**
   ```bash
   ./gradlew build
   # On Windows: gradlew.bat build
   ```

2. **Run the JAR file**
   ```bash
   java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
   ```

### Using IDE (IntelliJ IDEA, Eclipse, VS Code)

1. **Import as Gradle project**
2. **Run `BuddyApplication.kt`** as main class
3. **Or use Spring Boot dashboard** in your IDE

## 🗄️ Database Configuration

### H2 Database (Development - Default)
- **URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`
- **Password**: (empty)
- **Console**: `http://localhost:8080/h2-console`

### PostgreSQL (Production)
1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   
   # Windows: Download from postgresql.org
   ```

2. **Create database**
   ```sql
   CREATE DATABASE mybuddy;
   CREATE USER mybuddy_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE mybuddy TO mybuddy_user;
   ```

3. **Update application.yml**
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/mybuddy
       username: mybuddy_user
       password: your_password
     jpa:
       hibernate:
         ddl-auto: update
   ```

## 🔧 Configuration

### Application Properties
- **Port**: 8080 (configurable in `application.yml`)
- **Context Path**: `/api/v1` (configurable)
- **Database**: H2 (dev) / PostgreSQL (prod)
- **Logging**: INFO level (configurable)

### Environment Variables
```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/mybuddy
SPRING_DATASOURCE_USERNAME=mybuddy_user
SPRING_DATASOURCE_PASSWORD=your_password

# OpenAI API
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo

# Server
SERVER_PORT=8080
SERVER_SERVLET_CONTEXT_PATH=/api/v1
```

### Custom Configuration
Edit `src/main/resources/application.yml`:
```yaml
spring:
  profiles:
    active: dev  # or prod
  
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
  
  jpa:
    hibernate:
      ddl-auto: create-drop  # create-drop, update, validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true

server:
  port: 8080
  servlet:
    context-path: /api/v1

logging:
  level:
    com.buddyapp: DEBUG
    org.springframework.security: DEBUG
```

## 📱 Available Scripts

```bash
# Development
./gradlew bootRun          # Run application
./gradlew build            # Build project
./gradlew test             # Run tests
./gradlew clean            # Clean build artifacts

# Database
./gradlew flywayMigrate    # Run database migrations
./gradlew flywayInfo       # Show migration status

# Dependencies
./gradlew dependencies     # Show dependency tree
./gradlew dependencyInsight # Analyze specific dependency

# IDE Support
./gradlew idea             # Generate IntelliJ IDEA project
./gradlew eclipse          # Generate Eclipse project
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── kotlin/com/buddyapp/
│   │   │   ├── BuddyApplication.kt      # Main application class
│   │   │   ├── config/                  # Configuration classes
│   │   │   │   ├── SecurityConfig.kt    # Spring Security configuration
│   │   │   │   └── DatabaseConfig.kt    # Database configuration
│   │   │   ├── controllers/             # REST controllers
│   │   │   │   ├── ProfileController.kt # Profile management APIs
│   │   │   │   └── SearchController.kt  # Search and LLM APIs
│   │   │   ├── models/                  # Data models
│   │   │   │   ├── Profile.kt           # Profile entity
│   │   │   │   ├── SearchEntry.kt       # Search history entity
│   │   │   │   └── dto/                 # Data Transfer Objects
│   │   │   ├── repositories/            # Data access layer
│   │   │   │   └── ProfileRepository.kt # Profile data operations
│   │   │   ├── services/                # Business logic
│   │   │   │   ├── ProfileService.kt    # Profile business logic
│   │   │   │   └── LLMService.kt        # LLM integration
│   │   │   └── rules/                   # Business rules
│   │   └── resources/
│   │       ├── application.yml          # Application configuration
│   │       ├── schema.sql               # Database schema
│   │       └── data.sql                 # Initial data
│   └── test/
│       └── kotlin/com/buddyapp/         # Test classes
├── build.gradle.kts                      # Build configuration
├── settings.gradle.kts                   # Project settings
└── README.md                             # This file
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests ProfileServiceTest

# Run tests with coverage
./gradlew test jacocoTestReport
```

### Integration Tests
```bash
# Run integration tests
./gradlew integrationTest

# Run with specific profile
./gradlew integrationTest -Dspring.profiles.active=test
```

### API Testing
1. **Start the application**
2. **Use Postman or curl** to test endpoints
3. **Check API documentation** at `/swagger-ui.html`

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # macOS/Linux

# Kill process or change port in application.yml
server:
  port: 8081
```

#### Database Connection Issues
- **H2**: Check if H2 console is accessible at `/h2-console`
- **PostgreSQL**: Verify service is running and credentials are correct
- **Connection Pool**: Check `application.yml` for connection settings

#### Build Failures
```bash
# Clean and rebuild
./gradlew clean build

# Check Gradle version compatibility
./gradlew --version

# Update Gradle wrapper
./gradlew wrapper --gradle-version 8.5
```

#### Memory Issues
```bash
# Increase JVM memory
export GRADLE_OPTS="-Xmx2048m -XX:MaxPermSize=512m"

# Or in gradle.properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m
```

### Performance Issues
- **Database**: Check query performance and indexes
- **Memory**: Monitor JVM memory usage
- **Logging**: Reduce log level in production

## 📚 Dependencies

### Core Dependencies
- **Spring Boot**: 3.2.0
- **Kotlin**: 1.9.10
- **Spring Data JPA**: 3.2.0
- **Spring Security**: 6.2.0
- **Spring AI**: 0.8.0

### Database Dependencies
- **H2 Database**: 2.2.224 (dev)
- **PostgreSQL**: 42.7.1 (prod)
- **Hibernate**: 6.4.0

### Development Dependencies
- **Spring Boot Test**: 3.2.0
- **JUnit 5**: 5.10.0
- **Mockito**: 5.7.0
- **Gradle**: 8.5

## 🔄 Updates and Maintenance

### Updating Dependencies
```bash
# Check for outdated dependencies
./gradlew dependencyUpdates

# Update specific dependency
./gradlew dependencyInsight --dependency spring-boot-starter-web

# Update all dependencies
./gradlew dependencyUpdates --rejectVersionIf=.*-M.*
```

### Spring Boot Updates
```bash
# Use Spring Boot CLI
spring upgrade

# Or manually update version in build.gradle.kts
plugins {
    id 'org.springframework.boot' version '3.3.0'
}
```

### Database Migrations
```bash
# Run migrations
./gradlew flywayMigrate

# Check migration status
./gradlew flywayInfo

# Repair failed migrations
./gradlew flywayRepair
```

## 🚀 Deployment

### Docker Deployment
1. **Build Docker image**
   ```bash
   docker build -t mybuddy-backend .
   ```

2. **Run container**
   ```bash
   docker run -p 8080:8080 \
     -e SPRING_PROFILES_ACTIVE=prod \
     -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/mybuddy \
     mybuddy-backend
   ```

### Production Deployment
1. **Build production JAR**
   ```bash
   ./gradlew build -x test
   ```

2. **Deploy to server**
   ```bash
   scp build/libs/backend-0.0.1-SNAPSHOT.jar user@server:/app/
   ```

3. **Run with systemd** (Linux)
   ```bash
   sudo systemctl start mybuddy-backend
   sudo systemctl enable mybuddy-backend
   ```

## 📞 Support

For issues related to:
- **Backend Setup**: Check this README and troubleshooting section
- **Frontend Integration**: See `../frontend/README.md`
- **General Issues**: Check the main project README

## 🚀 Next Steps

After setting up the backend:
1. **Test the application** and verify all endpoints
2. **Configure database** (H2 for dev, PostgreSQL for prod)
3. **Set up OpenAI API key** for LLM functionality
4. **Configure frontend** to connect to backend APIs
5. **Test full integration** between frontend and backend

---

**Happy Coding! 🎉**
