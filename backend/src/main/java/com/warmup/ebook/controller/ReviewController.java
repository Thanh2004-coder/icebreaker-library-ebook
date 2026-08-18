package com.warmup.ebook.controller;

import com.warmup.ebook.dto.CreateReviewRequest;
import com.warmup.ebook.dto.ReviewDto;
import com.warmup.ebook.dto.ReviewListResponse;
import com.warmup.ebook.dto.ReviewStatsResponse;
import com.warmup.ebook.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews/{gameId}")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ReviewListResponse list(@PathVariable Long gameId) {
        return reviewService.listByGame(gameId);
    }

    @GetMapping("/stats")
    public ReviewStatsResponse stats(@PathVariable Long gameId) {
        return reviewService.stats(gameId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewDto create(@PathVariable Long gameId, @Valid @RequestBody CreateReviewRequest request) {
        return reviewService.create(gameId, request);
    }
}
