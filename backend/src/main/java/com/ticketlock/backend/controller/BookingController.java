package com.ticketlock.backend.controller;

import com.ticketlock.backend.dto.BookingRequest;
import com.ticketlock.backend.entity.Booking;
import com.ticketlock.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/event/{eventId}/seats")
    public List<String> getBookedSeats(@PathVariable Long eventId) {
        return bookingService.getBookedSeats(eventId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking bookSeat(
        @Valid @RequestBody BookingRequest request
    ) {
        return bookingService.bookSeat(request);
    }
}
