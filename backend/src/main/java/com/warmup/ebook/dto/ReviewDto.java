package com.warmup.ebook.dto;

import java.time.Instant;

public record ReviewDto(
        Long id,
        Long gameId,
        String reviewerName,
        String displayName,
        Integer rating,
        String comment,
        Instant createdAt
) {
    public static ReviewDto from(com.warmup.ebook.domain.Review review) {
        return new ReviewDto(
                review.getId(),
                review.getGameId(),
                review.getReviewerName(),
                review.getReviewerName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
