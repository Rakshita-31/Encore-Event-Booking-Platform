import { useEffect, useState } from 'react'
import {
  ArrowRight, ArrowLeft, CalendarDays, MapPin, Ticket,
  Search, Sparkles, ShieldCheck, CheckCircle2,
  LoaderCircle, LockKeyhole
} from 'lucide-react'
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "")

const formatPrice = value =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(value)

const formatDate = value =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  })

const fallbackImage =
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=85'

export default function App() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [bookedSeats, setBookedSeats] = useState([])
  const [seatsLoading, setSeatsLoading] = useState(false)
  const [seatsReady, setSeatsReady] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState('')
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [message, setMessage] = useState('')
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then(r => {
        if (!r.ok) throw new Error('Could not load events')
        return r.json()
      })
      .then(setEvents)
      .catch(err => setMessage(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function openEvent(event) {
    setSelectedEvent(event)
    setSelectedSeat('')
    setConfirmation(null)
    setMessage('')
    setBookedSeats([])
    setSeatsReady(false)
    setSeatsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/bookings/event/${event.id}/seats`)
      if (!response.ok) throw new Error('Could not load seat availability')
      setBookedSeats(await response.json())
      setSeatsReady(true)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSeatsLoading(false)
    }
  }

  async function reserveSeat() {
    if (!seatsReady || !selectedSeat || !name.trim()) {
      setMessage('Select a seat and enter your name.')
      return
    }

    setBooking(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          seatNumber: selectedSeat,
          customerName: name.trim()
        })
      })

      if (response.status === 401) {
        throw new Error(
          'Booking authentication is not configured for the frontend yet.'
        )
      }

      if (response.status === 409) {
        const seatsResponse = await fetch(
          `${API_BASE}/api/bookings/event/${selectedEvent.id}/seats`
        )
        if (seatsResponse.ok) setBookedSeats(await seatsResponse.json())
        setSelectedSeat('')
        throw new Error('That seat was just booked. Choose another.')
      }

      if (!response.ok) throw new Error('Booking failed. Please try again.')

      const result = await response.json()
      setConfirmation(result)
      setBookedSeats(previous => [...previous, selectedSeat])
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBooking(false)
    }
  }

  const filteredEvents = events.filter(event =>
    `${event.title} ${event.city} ${event.category}`
      .toLowerCase().includes(search.toLowerCase())
  )

  const seatCount = Math.min(selectedEvent?.totalSeats || 0, 312)
  const seats = Array.from({ length: seatCount }, (_, index) => {
    const row = String.fromCharCode(65 + Math.floor(index / 12))
    return `${row}${(index % 12) + 1}`
  })

  return (
    <div className="min-h-screen bg-[#090713] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 left-1/3 h-[550px] w-[550px] rounded-full bg-violet-700/15 blur-[130px]" />
        <div className="absolute right-0 top-96 h-[400px] w-[400px] rounded-full bg-fuchsia-700/10 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#090713]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={() => { setSelectedEvent(null); setConfirmation(null); setMessage('') }}
            className="flex items-center gap-2 text-2xl font-black tracking-tight"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <Ticket size={23} />
            </span>
            En<span className="text-violet-400">core.</span>
          </button>
          <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <span className="text-white">Discover</span>
            <span>Experiences</span>
            <span>How it works</span>
          </div>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-300">
            <ShieldCheck size={14} className="mr-1 inline" />
            Secure seat booking
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6">
        {!selectedEvent ? (
          <>
            <section className="py-20 md:py-28">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                <Sparkles size={14} /> Your next unforgettable moment
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
                Life is better <br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  when you're there.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-zinc-400">
                Discover incredible experiences, find your perfect spot,
                and book with confidence. Your seat is waiting.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a href="#events" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-7 py-4 font-semibold transition hover:bg-violet-500">
                  Explore events <ArrowRight size={18} />
                </a>
                <span className="flex items-center gap-2 text-sm text-zinc-400">
                  <LockKeyhole size={16} className="text-violet-400" />
                  Built for reliable reservations
                </span>
              </div>
            </section>

            <section id="events" className="pb-24">
              <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
                    Curated for you
                  </p>
                  <h2 className="text-3xl font-bold md:text-4xl">Upcoming experiences</h2>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <Search size={18} className="text-zinc-500" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search events or cities..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500 md:w-60"
                  />
                </div>
              </div>

              {loading && (
                <div className="flex items-center gap-3 py-20 text-zinc-400">
                  <LoaderCircle className="animate-spin" /> Loading events...
                </div>
              )}

              {message && <p className="mb-6 text-rose-400">{message}</p>}

              {!loading && (
                <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={() => openEvent(event)}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#151020] text-left transition hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-900/20"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={event.imageUrl || fallbackImage}
                          alt={event.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                        <span className="absolute left-4 top-4 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                          {event.category}
                        </span>
                      </div>
                      <div className="p-6">
                        <h3 className="mb-4 text-xl font-bold">{event.title}</h3>
                        <p className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
                          <CalendarDays size={16} className="text-violet-400" />
                          {formatDate(event.eventDate)}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-zinc-400">
                          <MapPin size={16} className="text-violet-400" />
                          {event.venue}, {event.city}
                        </p>
                        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                          <div>
                            <p className="text-xs text-zinc-500">Starting at</p>
                            <p className="text-xl font-bold">{formatPrice(event.price)}</p>
                          </div>
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 transition group-hover:bg-violet-500">
                            <ArrowRight size={19} />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && filteredEvents.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-zinc-400">
                  No events found. Try a different search.
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="py-10 pb-24">
            <button
              onClick={() => { setSelectedEvent(null); setMessage('') }}
              className="mb-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
            >
              <ArrowLeft size={17} /> Back to events
            </button>

            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <img
                  src={selectedEvent.imageUrl || fallbackImage}
                  alt={selectedEvent.title}
                  className="h-72 w-full rounded-2xl object-cover md:h-96"
                />
                <div className="mt-8">
                  <span className="text-sm font-semibold uppercase tracking-widest text-violet-400">
                    {selectedEvent.category}
                  </span>
                  <h1 className="mt-3 text-4xl font-black">{selectedEvent.title}</h1>
                  <p className="mt-4 text-zinc-400">{selectedEvent.description}</p>
                  <div className="mt-6 flex flex-wrap gap-5 text-sm text-zinc-300">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={17} className="text-violet-400" />
                      {formatDate(selectedEvent.eventDate)}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin size={17} className="text-violet-400" />
                      {selectedEvent.venue}, {selectedEvent.city}
                    </span>
                  </div>
                </div>

                <div className="mt-10 rounded-2xl border border-white/10 bg-[#151020] p-6">
                  <h2 className="mb-2 text-xl font-bold">Choose your seat</h2>
                  <p className="mb-8 text-sm text-zinc-400">
                    {seatsLoading ? "Checking seat availability..." : seatsReady ? "Select an available seat from the map below." : "Seat availability could not be loaded. Return to events and try again."}
                  </p>

                  <div className="mb-9 rounded-t-[50%] border-t-4 border-violet-400 bg-gradient-to-b from-violet-500/15 to-transparent py-5 text-center text-xs tracking-[0.4em] text-violet-300">
                    STAGE
                  </div>

                  <div className="mx-auto grid max-w-[480px] grid-cols-12 gap-1.5 sm:gap-2">
                    {seats.map(seat => {
                      const occupied = bookedSeats.includes(seat)
                      const selected = selectedSeat === seat
                      return (
                        <button
                          key={seat}
                          disabled={occupied || !!confirmation || !seatsReady || seatsLoading}
                          title={`${seat}${occupied ? ' — Booked' : ''}`}
                          onClick={() => { setSelectedSeat(seat); setMessage('') }}
                          className={`flex aspect-square items-center justify-center rounded-md text-[9px] font-semibold transition sm:text-xs ${
                            occupied
                              ? 'cursor-not-allowed bg-zinc-800 text-zinc-600'
                              : selected
                                ? 'bg-fuchsia-400 text-[#090713] shadow-lg shadow-fuchsia-500/30'
                                : 'bg-violet-700/50 text-violet-100 hover:bg-violet-500'
                          }`}
                        >
                          {seat}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-zinc-400">
                    <span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-violet-700" /> Available</span>
                    <span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-fuchsia-400" /> Selected</span>
                    <span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-zinc-800" /> Booked</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="sticky top-8 rounded-2xl border border-violet-500/20 bg-[#171122] p-7 shadow-2xl shadow-violet-950/20">
                  {confirmation ? (
                    <div className="text-center">
                      <CheckCircle2 size={54} className="mx-auto mb-5 text-emerald-400" />
                      <h2 className="text-2xl font-bold">You're booked!</h2>
                      <p className="mt-3 text-zinc-400">Your seat reservation is confirmed.</p>
                      <div className="my-7 rounded-xl border border-dashed border-violet-400/30 bg-violet-500/10 p-6">
                        <p className="text-sm text-zinc-400">Seat</p>
                        <p className="text-5xl font-black text-violet-300">{confirmation.seatNumber}</p>
                        <p className="mt-4 text-sm text-zinc-400">Booking #{confirmation.id}</p>
                      </div>
                      <button onClick={() => { setSelectedEvent(null); setConfirmation(null) }}
                        className="w-full rounded-xl bg-violet-600 py-3 font-semibold hover:bg-violet-500">
                        Explore more events
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 flex items-center gap-2">
                        <Ticket size={20} className="text-violet-400" />
                        <h2 className="text-xl font-bold">Your reservation</h2>
                      </div>
                      <div className="space-y-4 border-b border-white/10 pb-6 text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-zinc-400">Event</span>
                          <span className="text-right font-medium">{selectedEvent.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Selected seat</span>
                          <span className="font-bold text-violet-300">{selectedSeat || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Ticket price</span>
                          <span>{formatPrice(selectedEvent.price)}</span>
                        </div>
                      </div>
                      <div className="my-6 flex items-center justify-between">
                        <span className="text-zinc-400">Total</span>
                        <span className="text-3xl font-black">{formatPrice(selectedEvent.price)}</span>
                      </div>
                      <label className="mb-2 block text-sm text-zinc-400">Your name</label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="mb-5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-violet-500"
                      />
                      {message && (
                        <p className="mb-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{message}</p>
                      )}
                      <button
                        disabled={!seatsReady || seatsLoading || !selectedSeat || !name.trim() || booking}
                        onClick={reserveSeat}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 font-bold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {booking ? <LoaderCircle className="animate-spin" size={19} /> : <LockKeyhole size={18} />}
                        {booking ? 'Processing...' : 'Confirm booking'}
                      </button>
                      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
                        <ShieldCheck size={14} /> Protected against duplicate seat bookings
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-zinc-500">
          <span className="font-bold text-white">En<span className="text-violet-400">core.</span></span>
          <span>Made for moments worth remembering.</span>
          <span>© {new Date().getFullYear()} Encore</span>
        </div>
      </footer>
    </div>
  )
}

