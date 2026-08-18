package com.warmup.ebook.dto;

public record ReviewStatsResponse(
        Long gameId,
        Double averageRating,
        long reviewCount
) {
}
