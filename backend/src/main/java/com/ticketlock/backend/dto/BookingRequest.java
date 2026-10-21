package com.ticketlock.backend.dto;

import jakarta.validation.constraints.*;

public record BookingRequest(
    @NotNull Long eventId,
    @NotBlank String seatNumber,
    @NotBlank String customerName
) {}
