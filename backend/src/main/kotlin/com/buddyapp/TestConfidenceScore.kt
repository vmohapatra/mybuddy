package com.buddyapp

import com.buddyapp.models.dto.SearchSource

fun main() {
    println("=== Testing Confidence Score Calculation ===")
    
    // Test case 1: Empty sources
    val emptySources = emptyList<SearchSource>()
    val emptyScore = calculateConfidenceScore(emptySources)
    println("Empty sources score: $emptyScore (expected: 0.0)")
    
    // Test case 2: Single source
    val singleSource = listOf(
        SearchSource(
            title = "Test Source",
            url = "https://example.com",
            description = "Test description",
            type = "article",
            relevanceScore = 0.8
        )
    )
    val singleScore = calculateConfidenceScore(singleSource)
    println("Single source score: $singleScore (expected: 0.8)")
    
    // Test case 3: Multiple sources
    val multipleSources = listOf(
        SearchSource(
            title = "Source 1",
            url = "https://example1.com",
            description = "Description 1",
            type = "article",
            relevanceScore = 0.9
        ),
        SearchSource(
            title = "Source 2",
            url = "https://example2.com",
            description = "Description 2",
            type = "paper",
            relevanceScore = 0.7
        ),
        SearchSource(
            title = "Source 3",
            url = "https://example3.com",
            description = "Description 3",
            type = "blog",
            relevanceScore = 0.6
        )
    )
    val multipleScore = calculateConfidenceScore(multipleSources)
    println("Multiple sources score: $multipleScore (expected: 0.73)")
    
    // Test case 4: Edge cases
    val edgeCaseSources = listOf(
        SearchSource(
            title = "Edge Source",
            url = "https://edge.com",
            description = "Edge description",
            type = "article",
            relevanceScore = 1.5  // Invalid score > 1.0
        )
    )
    val edgeScore = calculateConfidenceScore(edgeCaseSources)
    println("Edge case score: $edgeScore (expected: 1.0)")
    
    println("=== Test Complete ===")
}

private fun calculateConfidenceScore(sources: List<SearchSource>): Double {
    if (sources.isEmpty()) return 0.0
    
    try {
        val totalRelevance = sources.sumOf { it.relevanceScore }
        val averageRelevance = totalRelevance / sources.size
        
        // Ensure the result is within valid bounds (0.0 to 1.0)
        return when {
            averageRelevance.isNaN() -> 0.0
            averageRelevance.isInfinite() -> 0.0
            averageRelevance < 0.0 -> 0.0
            averageRelevance > 1.0 -> 1.0
            else -> averageRelevance
        }
    } catch (e: Exception) {
        println("Error calculating confidence score: ${e.message}")
        return 0.0
    }
}
