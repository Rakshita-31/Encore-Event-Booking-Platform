package com.ticketlock.backend.service;

import com.ticketlock.backend.dto.BookingRequest;
import com.ticketlock.backend.entity.Booking;
import com.ticketlock.backend.entity.Event;
import com.ticketlock.backend.repository.BookingRepository;
import com.ticketlock.backend.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;

    public BookingService(
        BookingRepository bookingRepository,
        EventRepository eventRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional(readOnly = true)
    public List<String> getBookedSeats(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Event not found"
            );
        }

        return bookingRepository.findByEventId(eventId)
            .stream()
            .map(Booking::getSeatNumber)
            .toList();
    }

    @Transactional
    public Booking bookSeat(BookingRequest request) {
        Event event = eventRepository.findById(request.eventId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Event not found"
            ));

        String seat = request.seatNumber()
            .trim().toUpperCase(Locale.ROOT);

        if (!seat.matches("[A-Z][1-9][0-9]*")) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid seat format"
            );
        }

        int column;
        try {
            column = Integer.parseInt(seat.substring(1));
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid seat number"
            );
        }

        int row = seat.charAt(0) - 'A';
        long seatIndex = (long) row * 12 + column;

        if (column > 12 || seatIndex > event.getTotalSeats()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Seat does not exist for this event"
            );
        }

        Booking booking = new Booking();
        booking.setEvent(event);
        booking.setSeatNumber(seat);
        booking.setCustomerName(request.customerName().trim());
        booking.setBookedAt(LocalDateTime.now());

        return bookingRepository.saveAndFlush(booking);
    }
}
