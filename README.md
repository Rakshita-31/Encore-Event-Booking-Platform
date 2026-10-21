# Encore — Event Discovery & Seat Booking Platform

A full-stack event booking application built with **Java, Spring Boot, PostgreSQL, and React**. Explore upcoming events, view available seats, and reserve a seat through a responsive web interface.

**[Live Demo](https://encore-event-booking.vercel.app/)** · **[Backend API](https://encore-booking-api.onrender.com/api/events)**

> **Portfolio demo:** Events are sample listings; bookings are demonstration reservations, not paid tickets. The free backend instance may take time to wake up after inactivity.

## Features

- Browse six sample events with venue, city, category, date, and ticket price.
- Search events and view event details.
- Inspect an interactive seat map showing already reserved seats.
- Reserve a seat using a guest name and receive a booking confirmation.
- Prevent duplicate reservations using a **database-level unique constraint** on `(event_id, seat_number)`.
- Return **HTTP 409 Conflict** when a seat is already reserved.
- Persist events and bookings in hosted PostgreSQL.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, JavaScript, Tailwind CSS, Lucide React |
| Backend | Java 17, Spring Boot 4, Spring Web MVC, Spring Data JPA, Hibernate |
| Database | PostgreSQL (Neon) |
| Deployment | Vercel (frontend), Render (Dockerized backend) |
| Build | Maven Wrapper, npm |

## Architecture

```text
Browser
  |
  v
React / Vite frontend (Vercel)
  |  HTTPS REST requests
  v
Spring Boot API (Render, Docker)
  |  Spring Data JPA / Hibernate
  v
PostgreSQL database (Neon)
```

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/events` | List events |
| GET | `/api/events/{id}` | Get an event by ID |
| GET | `/api/bookings/event/{eventId}/seats` | List reserved seats for an event |
| POST | `/api/bookings` | Create a guest seat reservation |
| POST | `/api/events` | Create an event (protected endpoint) |

## How Double Booking Is Prevented

The booking table has a PostgreSQL uniqueness constraint across **event ID and seat number**. The backend saves reservations using `saveAndFlush`, so competing requests cannot both commit a booking for the same event seat. A duplicate reservation is reported to the client as **HTTP 409 Conflict**.

**Manual concurrency smoke test:** Two simultaneous requests attempted to book the same seat. One succeeded; the other was rejected with HTTP 409. This demonstrates the expected behavior for that test, not a full load or stress test.

## Run Locally

### Requirements

- Java 17
- Node.js and npm
- Access to a PostgreSQL database

### Backend

Configure these environment variables before starting the application:

```text
DB_URL=jdbc:postgresql://YOUR_HOST/YOUR_DATABASE?sslmode=require
DB_USER=YOUR_DATABASE_USER
DB_PASSWORD=YOUR_DATABASE_PASSWORD
PORT=8080
APP_FRONTEND_URL=http://localhost:5173
```

Do **not** commit real credentials.

From the repository root on Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The API is available at `http://localhost:8080/api/events`.

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

For local development, the Vite proxy forwards `/api` requests to `http://localhost:8080`. For hosted deployments, set `VITE_API_URL` to the public backend origin (without a trailing slash), then rebuild the frontend.

## Deployment

- **Backend:** Dockerized Spring Boot application hosted on Render; database configuration is supplied using environment variables.
- **Database:** Managed PostgreSQL on Neon.
- **Frontend:** Vite production build hosted on Vercel; `VITE_API_URL` points to the Render API.
- **CORS:** `APP_FRONTEND_URL` on Render specifies the deployed frontend origin.

## Project Status

The deployed demo has been manually checked for event listing, seat-map access, booking creation, and booked-seat persistence. Automated integration and load tests are future improvements.

## Repository

[GitHub — Encore Event Booking Platform](https://github.com/Rakshita-31/Encore-Event-Booking-Platform)
