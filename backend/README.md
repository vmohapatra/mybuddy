# MyBuddy Backend

A Spring Boot application written in Kotlin that provides RESTful APIs for the MyBuddy system, focused on search, search preferences, and LLM integration.

## 🚀 Quick Start

1. **Start the application**
   ```bash
   ./mvnw spring-boot:run
   ```

2. **Access Swagger UI**
   - Open: `http://localhost:8080/api/v1/swagger-ui.html`
   - View all available endpoints
   - Test APIs directly from the interface

3. **Configure OpenAI (Optional)**
   - Use the **Configuration** endpoints in Swagger
   - Set your API key without restarting
   - Enable/disable AI features dynamically

4. **Test the APIs**
   - Perform search requests and adjust preferences (including tone and audience)
   - All endpoints are documented with examples

## 🚀 Features

- **Spring Boot 3.2** with Kotlin
- **Spring AI**: OpenAI integration for LLM responses
- **RESTful APIs**: Clean, documented API endpoints with Swagger/OpenAPI
- **Dynamic Configuration**: Enable/disable OpenAI without restarting
- **Search Preferences**: Filter/sort and set tone/audience for LLM summaries
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

### Maven (Optional)
- **Version**: 3.6 or higher
- **Note**: Maven wrapper is included, so manual installation is optional
- **Installation**: Download from [maven.apache.org](https://maven.apache.org/download.cgi/)

### Verify Maven Installation
```bash
mvn --version  # Should show Maven 3.x or higher
```

## 🛠️ Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Verify project structure**
   ```bash
   ls -la
   # Should show: pom.xml, src/, etc.
   ```

3. **Check Maven wrapper**
   ```bash
   ./mvnw --version
   # On Windows: mvnw.cmd --version
   ```

## 🚀 Running the Application

### Development Mode (Recommended)

1. **Start the application**
   ```bash
   ./mvnw spring-boot:run
   # On Windows: mvnw.cmd spring-boot:run
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
   ./mvnw clean package
   # On Windows: mvnw.cmd clean package
   ```

2. **Run the JAR file**
   ```bash
   java -jar target/mybuddy-backend-0.0.1-SNAPSHOT.jar
   ```

### Using IDE (IntelliJ IDEA, Eclipse, VS Code)

1. **Import as Maven project**
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
./mvnw spring-boot:run     # Run application
./mvnw clean compile       # Clean and compile
./mvnw clean package       # Build project
./mvnw test                # Run tests

# Database
./mvnw spring-boot:run     # Run with H2 database
# PostgreSQL setup: Update application.yml

# Dependencies
./mvnw dependency:tree     # Show dependency tree
./mvnw dependency:resolve  # Resolve dependencies

# IDE Support
# Import as Maven project in IntelliJ IDEA, Eclipse, or VS Code
```

## 🏗️ Project Structure (Key Parts)

```
backend/
├── src/main/kotlin/com/buddyapp/
│   ├── BuddyApplication.kt
│   ├── config/
│   │   ├── OpenAiConfig.kt
│   │   ├── SearchConfig.kt
│   │   └── SwaggerConfig.kt
│   ├── controllers/
│   │   ├── ConfigController.kt
│   │   ├── SearchController.kt
│   │   └── SearchPreferencesController.kt
│   ├── services/
│   │   ├── LLMService.kt
│   │   ├── RealSearchService.kt
│   │   ├── SearchPreferencesService.kt
│   │   └── SearchService.kt
│   └── models/dto/
│       ├── SearchRequest.kt
│       ├── SearchResponse.kt
│       ├── SearchPreferences.kt
│       └── OpenAiConfig*.kt
└── src/main/resources/application.yml
```

## 📚 API Documentation & Testing

### Swagger/OpenAPI UI
The backend provides comprehensive API documentation through Swagger UI:

- **Swagger UI**: `http://localhost:8080/api/v1/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api/v1/api-docs`
- **API Base URL**: `http://localhost:8080/api/v1`

### Available API Endpoints

#### 🔧 Configuration
- GET `/api/v1/config/openai` – View OpenAI settings
- POST `/api/v1/config/openai` – Update OpenAI settings
- POST `/api/v1/config/openai/enable` – Enable OpenAI
- POST `/api/v1/config/openai/disable` – Disable OpenAI
- GET `/api/v1/config/status` – App status

#### 🔍 Search & LLM
- POST `/api/v1/search` – Perform AI-enhanced search. Respects SearchPreferences including `tone` and `audience`.

#### ⚙️ Search Preferences (helpers)
- GET `/api/v1/search/preferences/default`
- GET `/api/v1/search/preferences/academic`
- GET `/api/v1/search/preferences/news`
- GET `/api/v1/search/preferences/technical`

### Dynamic OpenAI Configuration
The backend supports **dynamic configuration** without restarting:

```json
POST /api/v1/config/openai
{
  "enabled": true,
  "apiKey": "sk-your-api-key-here",
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Benefits:**
- ✅ **No Restart Required**: Enable/disable AI features instantly
- ✅ **Real-time Updates**: Change settings while application is running
- ✅ **Easy Testing**: Quickly switch between AI and offline modes
- ✅ **Development Friendly**: No need to restart for configuration changes

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=ProfileServiceTest

# Run tests with coverage
./mvnw test jacocoTestReport
```

### Integration Tests
```bash
# Run integration tests
./mvnw test -Dtest=*IntegrationTest

# Run with specific profile
./mvnw test -Dspring.profiles.active=test
```

### API Testing
1. **Start the application**: `./mvnw spring-boot:run`
2. **Access Swagger UI**: `http://localhost:8080/api/v1/swagger-ui.html`
3. **Test endpoints directly** from the Swagger interface
4. **Use Postman or curl** for advanced testing

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
# Clean and rebuild (Maven)
mvn clean package -DskipTests
```

#### Memory Issues
Increase JVM heap when running the JAR, if needed:
```bash
java -Xmx2048m -jar target/mybuddy-backend-0.0.1-SNAPSHOT.jar
```

### Performance Issues
- **Database**: Check query performance and indexes
- **Memory**: Monitor JVM memory usage
- **Logging**: Reduce log level in production

## 📚 Dependencies

### Core Dependencies
- **Spring Boot**: 3.2.0
- **Kotlin**: 1.9.20
- **Spring Data JPA**: 3.2.0
- **Spring Security**: 6.2.0
- **Spring AI**: 0.8.0

### Database Dependencies
- **H2 Database**: 2.2.224 (dev)
- **PostgreSQL**: 42.7.1 (prod)
- **Hibernate**: 6.4.0

### API Documentation
- **SpringDoc OpenAPI**: 2.2.0
- **Swagger UI**: 5.2.0
- **OpenAPI 3**: Full specification support

### Development Dependencies
- **Spring Boot Test**: 3.2.0
- **JUnit 5**: 5.10.0
- **Mockito**: 5.7.0
- **Maven**: 3.9.5 (wrapper included)

## 🔄 Updates and Maintenance

### Updating Dependencies
```bash
# Check for outdated dependencies
./mvnw versions:display-dependency-updates

# Update specific dependency
./mvnw dependency:tree -Dverbose

# Update all dependencies
./mvnw versions:use-latest-versions
```

### Spring Boot Updates
```bash
# Use Spring Boot CLI
spring upgrade

# Or manually update version in pom.xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
</parent>
```

### Database Migrations
```bash
# H2 database (development)
# Schema is auto-generated with ddl-auto: create-drop

# PostgreSQL (production)
# Use Flyway or manual schema management
# Update application.yml for production database
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
   ./mvnw clean package -DskipTests
   ```

2. **Deploy to server**
   ```bash
   scp target/mybuddy-backend-0.0.1-SNAPSHOT.jar user@server:/app/
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
