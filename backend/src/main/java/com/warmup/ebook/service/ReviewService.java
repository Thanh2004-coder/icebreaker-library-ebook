package com.warmup.ebook.service;

import com.warmup.ebook.domain.Review;
import com.warmup.ebook.dto.CreateReviewRequest;
import com.warmup.ebook.dto.ReviewDto;
import com.warmup.ebook.dto.ReviewListResponse;
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
        List<ReviewDto> reviews = reviewRepository.findByGameIdOrderByCreatedAtDesc(gameId).stream()
                .map(ReviewDto::from)
                .toList();
        long count = reviews.size();
        Double average = count == 0
                ? null
                : BigDecimal.valueOf(reviews.stream().mapToInt(ReviewDto::rating).average().orElse(0))
                        .setScale(1, RoundingMode.HALF_UP)
                        .doubleValue();
        return new ReviewListResponse(gameId, average, count, reviews);
    }

    @Transactional
    public ReviewDto create(Long gameId, CreateReviewRequest request) {
        if (gameId == null || gameId < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "gameId khong hop le.");
        }

        Review review = new Review();
        review.setGameId(gameId);
        review.setReviewerName(request.getReviewerName().trim());
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        return ReviewDto.from(reviewRepository.save(review));
    }
}
