package com.buddyapp.controllers

import com.buddyapp.models.dto.SearchPreferences
import com.buddyapp.services.SearchPreferencesService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/search/preferences")
@Tag(name = "Search Preferences", description = "Manage search preferences and filters")
open class SearchPreferencesController(
    private val searchPreferencesService: SearchPreferencesService
) {
    
    @GetMapping("/default")
    @Operation(
        summary = "Get Default Search Preferences",
        description = "Retrieve default search preferences for new users"
    )
    fun getDefaultPreferences(): ResponseEntity<SearchPreferences> {
        val preferences = searchPreferencesService.getDefaultPreferences()
        return ResponseEntity.ok(preferences)
    }
    
    @GetMapping("/academic")
    @Operation(
        summary = "Get Academic Search Preferences",
        description = "Retrieve search preferences optimized for academic research"
    )
    fun getAcademicPreferences(): ResponseEntity<SearchPreferences> {
        val preferences = searchPreferencesService.getAcademicPreferences()
        return ResponseEntity.ok(preferences)
    }
    
    @GetMapping("/news")
    @Operation(
        summary = "Get News Search Preferences",
        description = "Retrieve search preferences optimized for current news and articles"
    )
    fun getNewsPreferences(): ResponseEntity<SearchPreferences> {
        val preferences = searchPreferencesService.getNewsPreferences()
        return ResponseEntity.ok(preferences)
    }
    
    @GetMapping("/technical")
    @Operation(
        summary = "Get Technical Search Preferences",
        description = "Retrieve search preferences optimized for technical documentation and code"
    )
    fun getTechnicalPreferences(): ResponseEntity<SearchPreferences> {
        val preferences = searchPreferencesService.getTechnicalPreferences()
        return ResponseEntity.ok(preferences)
    }
    
    @PostMapping("/custom")
    @Operation(
        summary = "Create Custom Search Preferences",
        description = "Create custom search preferences based on user requirements"
    )
    fun createCustomPreferences(@RequestBody preferences: SearchPreferences): ResponseEntity<SearchPreferences> {
        // Validate preferences
        val validatedPreferences = preferences.copy(
            minRelevanceScore = preferences.minRelevanceScore.coerceIn(0.0, 1.0),
            maxResults = preferences.maxResults.coerceIn(1, 100),
            language = preferences.language.ifBlank { "en" }
        )
        
        return ResponseEntity.ok(validatedPreferences)
    }
    
    @GetMapping("/content-types")
    @Operation(
        summary = "Get Available Content Types",
        description = "Retrieve list of available content types for filtering"
    )
    fun getAvailableContentTypes(): ResponseEntity<List<String>> {
        val contentTypes = listOf(
            "research_paper",
            "news",
            "blog",
            "encyclopedia",
            "documentation",
            "code_repository",
            "qa_forum",
            "tutorial",
            "academic",
            "article",
            "video",
            "podcast"
        )
        return ResponseEntity.ok(contentTypes)
    }
    
    @GetMapping("/sort-options")
    @Operation(
        summary = "Get Available Sort Options",
        description = "Retrieve list of available sorting options for search results"
    )
    fun getAvailableSortOptions(): ResponseEntity<List<String>> {
        val sortOptions = listOf("relevance", "date", "title")
        return ResponseEntity.ok(sortOptions)
    }
}
