package com.buddyapp.controllers

import com.buddyapp.models.dto.SearchRequest
import com.buddyapp.models.dto.SearchResponse
import com.buddyapp.models.dto.SearchFeedbackRequest
import com.buddyapp.services.SearchService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/search")
@Tag(name = "Search System", description = "AI-powered search with personality-based analysis and history tracking")
open class SearchController(
    private val searchService: SearchService
) {
    
    @PostMapping
    @Operation(
        summary = "Perform AI-Powered Search",
        description = "Execute a search query and get AI-generated summary with categorized sources and confidence score"
    )
    fun performSearch(@RequestBody request: SearchRequest): ResponseEntity<SearchResponse> {
        val searchResult = searchService.performSearch(request)
        return ResponseEntity.ok(searchResult)
    }
    
    @PostMapping("/feedback")
    @Operation(
        summary = "Submit Search Feedback",
        description = "Submit feedback for search results to improve AI learning"
    )
    fun submitFeedback(@RequestBody request: SearchFeedbackRequest): ResponseEntity<Unit> {
        searchService.submitFeedback(request)
        return ResponseEntity.ok().build()
    }
}
