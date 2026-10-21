package com.ticketlock.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleConflict(
        DataIntegrityViolationException ex
    ) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(Map.of(
                "message", "Seat is already booked or booking conflicts with database constraints"
            ));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleStatus(
        ResponseStatusException ex
    ) {
        return ResponseEntity.status(ex.getStatusCode())
            .body(Map.of("message",
                ex.getReason() == null ? "Request failed" : ex.getReason()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
        MethodArgumentNotValidException ex
    ) {
        return ResponseEntity.badRequest()
            .body(Map.of("message", "Invalid booking details"));
    }
}
