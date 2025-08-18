package com.buddyapp

import com.buddyapp.services.RealSearchService
import com.buddyapp.models.dto.SearchSource
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

/**
 * Demo component to test real search functionality
 * This will run when the application starts (if enabled)
 */
@Component
class SearchDemo(
    private val realSearchService: RealSearchService
) : CommandLineRunner {
    
    override fun run(vararg args: String?) {
        // Only run demo if explicitly enabled
        if (System.getProperty("search.demo.enabled") == "true") {
            println("=== Search Demo Starting ===")
            
            try {
                // Test search
                val query = "artificial intelligence trends 2024"
                println("Searching for: $query")
                
                val results = realSearchService.performRealSearch(query, 10)
                println("Found ${results.size} results:")
                
                results.forEachIndexed { index, source ->
                    println("${index + 1}. ${source.title}")
                    println("   URL: ${source.url}")
                    println("   Type: ${source.type}")
                    println("   Score: ${(source.relevanceScore * 100).toInt()}%")
                    println("   Description: ${source.description.take(100)}...")
                    println()
                }
                
            } catch (e: Exception) {
                println("Demo failed: ${e.message}")
                e.printStackTrace()
            }
            
            println("=== Search Demo Complete ===")
        }
    }
}
