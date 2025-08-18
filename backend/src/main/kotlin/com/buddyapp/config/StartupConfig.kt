package com.buddyapp.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
open class StartupConfig : CommandLineRunner {
    
    @Value("\${openai.enabled:false}")
    private lateinit var openAiEnabled: String
    
    @Value("\${openai.api-key:}")
    private lateinit var openAiApiKey: String
    
    override fun run(vararg args: String?) {
        println("\n" + "=".repeat(60))
        println("🚀 MyBuddy Backend Started Successfully!")
        println("=".repeat(60))
        
        if (openAiEnabled == "true" && openAiApiKey.isNotBlank()) {
            println("✅ OpenAI Integration: ENABLED")
            println("🤖 AI Features: Available")
        } else {
            println("⚠️  OpenAI Integration: DISABLED")
            println("🔧 AI Features: Limited (Offline Mode)")
            println("\nTo enable AI features:")
            println("1. Set OPENAI_API_KEY environment variable")
            println("2. Set openai.enabled=true in application.yml")
            println("3. Restart the application")
        }
        
        println("\n📊 Application Info:")
        println("   • Port: 8080")
        println("   • Context: /api/v1")
        println("   • Database: H2 (http://localhost:8080/h2-console)")
        println("   • Health: http://localhost:8080/api/v1/actuator/health")
        
        println("\n🔗 Available Endpoints:")
        println("   • Profiles: http://localhost:8080/api/v1/profiles")
        println("   • Chat: http://localhost:8080/api/v1/chat")
        println("   • Search: http://localhost:8080/api/v1/search")
        println("   • Configuration: http://localhost:8080/api/v1/config")
        
        println("\n📚 API Documentation:")
        println("   • Swagger UI: http://localhost:8080/api/v1/swagger-ui.html")
        println("   • OpenAPI JSON: http://localhost:8080/api/v1/api-docs")
        
        println("=".repeat(60) + "\n")
    }
}
