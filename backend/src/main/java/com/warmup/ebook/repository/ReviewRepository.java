package com.warmup.ebook.repository;

import com.warmup.ebook.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByGameIdOrderByCreatedAtDesc(Long gameId);

    long countByGameId(Long gameId);

    @Query("select avg(r.rating) from Review r where r.gameId = :gameId")
    Double averageRatingByGameId(@Param("gameId") Long gameId);
}
