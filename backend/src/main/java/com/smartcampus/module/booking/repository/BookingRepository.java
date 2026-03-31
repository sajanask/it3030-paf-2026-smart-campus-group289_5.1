package com.smartcampus.module.booking.repository;

import com.smartcampus.module.booking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByResourceIdAndDate(String resourceId, LocalDate date);
}