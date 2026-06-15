package com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.entity.JobOffer;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
}