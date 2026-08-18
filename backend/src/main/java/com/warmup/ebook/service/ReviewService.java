package com.warmup.ebook.service;

import com.warmup.ebook.domain.Review;
import com.warmup.ebook.dto.CreateReviewRequest;
import com.warmup.ebook.dto.ReviewDto;
import com.warmup.ebook.dto.ReviewListResponse;
import com.warmup.ebook.dto.ReviewStatsResponse;
import com.warmup.ebook.repository.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public ReviewListResponse listByGame(Long gameId) {
        requireGameId(gameId);
        List<ReviewDto> reviews = reviewRepository.findByGameIdOrderByCreatedAtDesc(gameId).stream()
                .map(ReviewDto::from)
                .toList();
        ReviewStatsResponse stats = stats(gameId);
        return new ReviewListResponse(gameId, stats.averageRating(), stats.reviewCount(), reviews);
    }

    @Transactional(readOnly = true)
    public ReviewStatsResponse stats(Long gameId) {
        requireGameId(gameId);
        long count = reviewRepository.countByGameId(gameId);
        Double rawAverage = reviewRepository.averageRatingByGameId(gameId);
        Double average = null;
        if (count > 0 && rawAverage != null) {
            average = BigDecimal.valueOf(rawAverage.doubleValue())
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }
        return new ReviewStatsResponse(gameId, average, count);
    }

    @Transactional
    public ReviewDto create(Long gameId, CreateReviewRequest request) {
        requireGameId(gameId);

        Review review = new Review();
        review.setGameId(gameId);
        review.setReviewerName(request.getReviewerName().trim());
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        return ReviewDto.from(reviewRepository.save(review));
    }

    private void requireGameId(Long gameId) {
        if (gameId == null || gameId < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "gameId khong hop le.");
        }
    }
}
