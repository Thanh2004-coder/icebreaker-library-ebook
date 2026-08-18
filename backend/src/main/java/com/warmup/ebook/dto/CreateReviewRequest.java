package com.warmup.ebook.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateReviewRequest {

    @NotBlank(message = "Ten nguoi danh gia khong duoc rong")
    @Size(max = 80, message = "Ten nguoi danh gia toi da 80 ky tu")
    private String reviewerName;

    @NotNull(message = "Rating la bat buoc")
    @Min(value = 1, message = "Rating toi thieu la 1")
    @Max(value = 5, message = "Rating toi da la 5")
    private Integer rating;

    @NotBlank(message = "Noi dung danh gia khong duoc rong")
    @Size(max = 1000, message = "Noi dung toi da 1000 ky tu")
    private String comment;

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public void setDisplayName(String displayName) {
        if (this.reviewerName == null || this.reviewerName.isBlank()) {
            this.reviewerName = displayName;
        }
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
