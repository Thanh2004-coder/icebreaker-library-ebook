package com.warmup.ebook.dto;

import java.util.List;

public record ReviewListResponse(
        Long gameId,
        Double averageRating,
        long reviewCount,
        List<ReviewDto> reviews
) {
}
