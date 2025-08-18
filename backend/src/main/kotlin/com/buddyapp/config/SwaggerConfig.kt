package com.buddyapp.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.License
import io.swagger.v3.oas.models.servers.Server
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
open class SwaggerConfig {
    
    @Bean
    open fun openAPI(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("MyBuddy Backend API")
                    .description("AI-Powered Personal Assistant Backend API. Quick Start: 1) Access Swagger UI to test endpoints, 2) Configure OpenAI using Configuration endpoints, 3) Test APIs. Configuration Management: POST /api/v1/config/openai to set OpenAI API key, GET /api/v1/config/openai to check status, POST /api/v1/config/openai/enable/disable for quick toggle. Available Endpoints: Profiles, Chat, Search, Configuration. Base URL: All endpoints prefixed with /api/v1. Authentication: Development mode, no auth required.")
                    .version("1.0.0")
                    .contact(
                        Contact()
                            .name("MyBuddy Team")
                            .email("support@mybuddy.app")
                            .url("https://mybuddy.app")
                    )
                    .license(
                        License()
                            .name("MIT License")
                            .url("https://opensource.org/licenses/MIT")
                    )
            )
            .addServersItem(
                Server()
                    .url("http://localhost:8080/api/v1")
                    .description("Local Development Server with API Base Path")
            )
    }
}
