import React, { useState } from 'react';
import { CalendarClock, X, Check, Lock, Unlock, Clock, MapPin, User } from 'lucide-react';
import { InspectionWindow, InspectionBooking, User as AppUser, Location, Person, Inspection } from '../types';

interface InspectionBookingTabProps {
  currentUser: AppUser;
  windows: InspectionWindow[];
  locations: Location[];
  persons: Person[];
  onUpdateWindow: (w: InspectionWindow) => void;
  onAddInspection: (inspection: Inspection, logDetails: string) => void;
  standalone?: boolean; // true = department user booking page, false = HSEO portal
}

export default function InspectionBookingTab({
  currentUser, windows, locations, persons,
  onUpdateWindow, onAddInspection, standalone = false
}: InspectionBookingTabProps) {

  // Identity is locked to the signed-in user (chosen on the landing page) — there is no
  // self-identification step, so a user can never book as someone else.
  const matchedPerson = persons.find(p => p.name === currentUser.name || p.email === currentUser.email);

  // Department user: booking form (multiple time slots + one or more locations)
  const [bookingWindowId, setBookingWindowId] = useState<string | null>(null);
  const [bookDates, setBookDates] = useState<string[]>([]);
  const [bookTimes, setBookTimes] = useState<string[]>([]);
  const [bookLocationIds, setBookLocationIds] = useState<string[]>([]);

  // Resolve the active person & department (standalone identity is the signed-in user)
  const activePerson = standalone
    ? matchedPerson || null
    : persons.find(p => p.name === currentUser.name || p.id === currentUser.id) || null;
  const userDepartment = activePerson?.department || '';

  // Windows visible to the department user (their department only, and only if they are PI or contact for the locations)
  const myWindows = windows.filter(w => {
    if (w.department !== userDepartment) return false;
    // Check if user is PI or contact for any location in this window
    const pid = activePerson?.id;
    if (!pid) return false;
    // Parse window title to get location names
    const windowLocPattern = w.title.replace('Inspection Booking: ', '');
    const windowLocs = locations.filter(l => {
      const locPattern = `${l.building} Rm ${l.roomNumber}`;
      return windowLocPattern.includes(locPattern);
    });
    // Check if user is PI or delegate for any of these locations
    return windowLocs.some(l => l.piIds.includes(pid) || l.piDelegateIds.includes(pid));
  });

  const openWindows = myWindows.filter(w => w.status === 'open');
  const closedWindows = myWindows.filter(w => w.status === 'closed');

  // Generate dates between start and end
  const getDatesInRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const d = new Date(start);
    const endDate = new Date(end);
    while (d <= endDate) {
      // Skip weekends
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dates.push(d.toISOString().split('T')[0]);
      }
      d.setDate(d.getDate() + 1);
    }
    return dates;
  };

  // --- Department user: Book slots ---
  const bookingWindow = windows.find(w => w.id === bookingWindowId);
  const availableDates = bookingWindow ? getDatesInRange(bookingWindow.startDate, bookingWindow.endDate) : [];

  // Check if a time slot has already been booked by someone else
  // Once a slot is booked, it's exclusive to that booking (no other PI can book the same slot)
  const isSlotBooked = (w: InspectionWindow, date: string, time: string): boolean => {
    return w.bookings.some(b => b.date === date && b.time === time);
  };

  // Check if a slot is fully booked (already taken by another booking)
  const isSlotFull = (w: InspectionWindow, date: string, time: string): boolean => {
    return isSlotBooked(w, date, time);
  };

  // A location can only be inspected once per window — once booked it cannot be
  // booked again at another date/time.
  const isLocationBooked = (w: InspectionWindow, locationId: string) =>
    w.bookings.some(b => (b.locationIds || []).includes(locationId));

  const toggleBookLocation = (id: string) =>
    setBookLocationIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleBookDate = (date: string) =>
    setBookDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);

  const toggleBookTime = (time: string) =>
    setBookTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);

  const selectAllLocations = () => {
    const allLocIds = bookingLocations.filter(l => !isLocationBooked(bookingWindow!, l.id)).map(l => l.id);
    setBookLocationIds(allLocIds);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingWindow || bookDates.length === 0 || bookTimes.length === 0 || bookLocationIds.length === 0) return;

    const bookedByName = standalone ? (activePerson?.name || 'Department User') : currentUser.name;
    const newBookings: InspectionBooking[] = [];
    let inspCounter = 0;

    // Create a booking for each date/time combination
    bookDates.forEach(date => {
      bookTimes.forEach(time => {
        const inspectionIds: string[] = [];
        // One inspection record per location for this date/time
        bookLocationIds.forEach((locId) => {
          const loc = locations.find(l => l.id === locId);
          const newInsp: Inspection = {
            id: `insp_${Date.now()}_${inspCounter++}`,
            title: `${loc?.building || ''} Rm ${loc?.roomNumber || ''} — Scheduled Inspection`,
            date: date,
            inspectorId: bookingWindow.openedById,
            inspectorName: bookingWindow.openedBy,
            ftmId: bookingWindow.openedById,
            status: 'pending',
            inspectionStatus: 'scheduled',
            inspectionType: 'scheduled',
            department: bookingWindow.department,
            score: 100,
            findings: [],
            locationId: locId,
            scheduledMonth: `${new Date(date).toLocaleString('en', { month: 'long' })} ${new Date(date).getFullYear()}`,
            appointmentDate: date
          };
          inspectionIds.push(newInsp.id);
          onAddInspection(newInsp, `Inspection booked by ${bookedByName} for ${loc?.building} Rm ${loc?.roomNumber} on ${date} at ${time}`);
        });

        const booking: InspectionBooking = {
          id: 'ibk_' + Date.now() + '_' + date + '_' + time,
          date: date,
          time: time,
          locationIds: bookLocationIds,
          bookedBy: activePerson?.id || currentUser.id,
          bookedByName,
          inspectionIds
        };
        newBookings.push(booking);
      });
    });

    onUpdateWindow({ ...bookingWindow, bookings: [...bookingWindow.bookings, ...newBookings] });

    setBookingWindowId(null);
    setBookDates([]); setBookTimes([]); setBookLocationIds([]);
  };

  // Locations available for booking (in the window's department, restricted to user's associated locations)
  const bookingLocations = bookingWindow
    ? locations.filter(l => {
        if (l.department !== bookingWindow.department || l.status !== 'Active') return false;
        // Department users can only book locations they are associated with (PI or delegate)
        const pid = activePerson?.id;
        if (!pid) return false;
        return l.piIds.includes(pid) || l.piDelegateIds.includes(pid);
      })
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-indigo-400" /> Inspection Booking
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose an available date, time, and location for your inspection.
          </p>
        </div>
      </div>

      {/* Standalone: identity is locked to the signed-in user */}
      {standalone && (
        activePerson ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Booking as</p>
                <p className="text-sm font-bold text-slate-100">{activePerson.name}</p>
                <p className="text-[11px] text-slate-400">{userDepartment}{activePerson.title ? ` — ${activePerson.title}` : ''}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-[10px] font-bold uppercase">
              <Lock className="h-3 w-3" /> Verified
            </span>
          </div>
        ) : (
          <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-6 text-center">
            <User className="h-8 w-8 mx-auto mb-2 text-rose-400/60" />
            <p className="text-sm font-semibold text-rose-200">No personnel record found for “{currentUser.name}”</p>
            <p className="text-xs text-rose-300/70 mt-1">Only registered department personnel can book inspections. Please return to the home page and sign in with your own account.</p>
          </div>
        )
      )}

      {/* Windows content (hidden in standalone unless the signed-in user has a personnel record) */}
      {(!standalone || activePerson) && (<>
      {/* Open Windows */}
      {openWindows.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Open for Booking</span>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {openWindows.map(w => {
              const dates = getDatesInRange(w.startDate, w.endDate);
              const totalSlots = dates.length * w.timeSlots.length;
              const takenSlots = w.bookings.length;
              // Filter locations in this window to only those the viewing user is PI/delegate for
              const pid = activePerson?.id;
              const windowLocPattern = w.title.replace('Inspection Booking: ', '');
              const userLocNames = locations.filter(l => {
                const locPattern = `${l.building} Rm ${l.roomNumber}`;
                if (!windowLocPattern.includes(locPattern)) return false;
                if (!pid) return false;
                return l.piIds.includes(pid) || l.piDelegateIds?.includes(pid);
              }).map(l => `${l.building} Rm ${l.roomNumber}`);
              const displayTitle = userLocNames.length > 0
                ? `Inspection Booking: ${userLocNames.join(', ')}`
                : w.title;
              return (
                <div key={w.id} className="bg-slate-900 border border-emerald-900/30 rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{displayTitle}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{w.department}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border bg-emerald-950/40 text-emerald-300 border-emerald-900/30">
                      <Unlock className="h-3 w-3" /> Open
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5 text-indigo-400" /> {w.startDate} → {w.endDate}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-500" /> {w.timeSlots.join(', ')}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Opened by {w.openedBy}</span>
                    <span className="font-mono">{takenSlots}/{totalSlots} slots booked</span>
                  </div>

                  {/* User's bookings in this window */}
                  {(() => {
                    const pid = activePerson?.id;
                    const pname = activePerson?.name;
                    const userBookings = w.bookings.filter(b => {
                      // Match by person ID or name
                      if (pid && b.bookedBy === pid) return true;
                      if (pname && b.bookedByName === pname) return true;
                      // Also match if user is PI or contact for any booked location
                      if (pid && b.locationIds) {
                        return b.locationIds.some(locId => {
                          const loc = locations.find(l => l.id === locId);
                          return loc && (loc.piIds.includes(pid) || loc.piDelegateIds.includes(pid));
                        });
                      }
                      return false;
                    });
                    if (userBookings.length === 0) return null;
                    return (
                      <div className="border-t border-slate-800 pt-2 space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-500">Your Bookings</span>
                        {userBookings.map(b => {
                          const locs = (b.locationIds || []).map(id => locations.find(l => l.id === id)).filter(Boolean);
                          return (
                            <div key={b.id} className="text-[10px] text-slate-400">
                              <div className="flex items-start gap-2">
                                <Check className="h-3 w-3 text-emerald-300 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-slate-300 font-semibold">{b.date} {b.time}</span>
                                </div>
                              </div>
                              {locs.map(l => (
                                <div key={l!.id} className="pl-5 text-slate-400">
                                  • {l!.building} Rm {l!.roomNumber} <span className="text-slate-600">({l!.roomNature})</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Book button or already booked message */}
                  {(() => {
                    const pid = activePerson?.id;
                    const pname = activePerson?.name;
                    const userBookings = w.bookings.filter(b => {
                      if (pid && b.bookedBy === pid) return true;
                      if (pname && b.bookedByName === pname) return true;
                      if (pid && b.locationIds) {
                        return b.locationIds.some(locId => {
                          const loc = locations.find(l => l.id === locId);
                          return loc && (loc.piIds.includes(pid) || loc.piDelegateIds.includes(pid));
                        });
                      }
                      return false;
                    });
                    if (userBookings.length > 0) {
                      return (
                        <div className="w-full py-2 rounded-lg bg-slate-800/60 text-slate-400 text-xs font-bold text-center">
                          ✓ Booked — Email {w.openedBy} for changes
                        </div>
                      );
                    }
                    return (
                      <button onClick={() => { setBookingWindowId(w.id); setBookDates([]); setBookTimes([]); setBookLocationIds([]); }}
                        className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">
                        Book a Slot
                      </button>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {openWindows.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <CalendarClock className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No booking windows available for your department yet.</p>
        </div>
      )}

      {/* Closed / Past Windows */}
      {closedWindows.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Closed Windows</span>
          <div className="space-y-2">
            {closedWindows.map(w => {
              const pid = activePerson?.id;
              const windowLocPattern = w.title.replace('Inspection Booking: ', '');
              const userLocNames = locations.filter(l => {
                const locPattern = `${l.building} Rm ${l.roomNumber}`;
                if (!windowLocPattern.includes(locPattern)) return false;
                if (!pid) return false;
                return l.piIds.includes(pid) || l.piDelegateIds?.includes(pid);
              }).map(l => `${l.building} Rm ${l.roomNumber}`);
              const displayTitle = userLocNames.length > 0
                ? `Inspection Booking: ${userLocNames.join(', ')}`
                : w.title;
              return (
              <div key={w.id} className="bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-3.5 w-3.5 text-slate-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-400">{displayTitle}</span>
                    <span className="text-[10px] text-slate-600 block">{w.department} — {w.startDate} to {w.endDate} — {w.bookings.length} bookings</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
      </>)}

      {/* ===== BOOKING MODAL (Department User) ===== */}
      {bookingWindow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setBookingWindowId(null)}>
          <div className="bg-slate-900 border border-indigo-600/30 rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-100">Book Inspection Slot</h3>
              <button onClick={() => setBookingWindowId(null)} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
            </div>

            <p className="text-[11px] text-slate-400 mb-4">{bookingWindow.title} — {bookingWindow.department}</p>

            <form onSubmit={handleBook} className="space-y-4">
              {bookingLocations.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No locations are associated with your account in this department.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Contact HSEO to be assigned as a PI or delegate for a location.</p>
                </div>
              ) : (
              <>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Date(s) * <span className="normal-case font-medium text-slate-500">— select one or more</span></label>
                <div className="grid grid-cols-5 gap-1.5">
                  {availableDates.map(d => {
                    const dayName = new Date(d).toLocaleString('en', { weekday: 'short' });
                    const dayNum = new Date(d).getDate();
                    const monthShort = new Date(d).toLocaleString('en', { month: 'short' });
                    const isSelected = bookDates.includes(d);
                    return (
                      <button key={d} type="button" onClick={() => toggleBookDate(d)}
                        className={`py-2 px-1 rounded-lg text-center border transition ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}>
                        <span className="block text-[9px] uppercase">{dayName}</span>
                        <span className="block text-sm font-bold">{dayNum}</span>
                        <span className="block text-[8px]">{monthShort}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {bookDates.length > 0 && (
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Time(s) * <span className="normal-case font-medium text-slate-500">— select one or more (booked slots are exclusive)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {bookingWindow.timeSlots.map(t => {
                      // Check if this slot is full across all selected dates
                      const allDatesFull = bookDates.every(d => isSlotFull(bookingWindow, d, t));
                      return (
                        <button key={t} type="button" disabled={allDatesFull}
                          onClick={() => toggleBookTime(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                            allDatesFull
                              ? 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed line-through'
                              : bookTimes.includes(t)
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/50'
                          }`}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {bookDates.length > 0 && bookTimes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] text-slate-400 uppercase font-bold">
                      Location(s) * <span className="normal-case font-medium text-slate-500">— select one or more</span>
                    </label>
                    <button type="button" onClick={selectAllLocations}
                      className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition">
                      Select all
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {bookingLocations.map(l => {
                      const booked = isLocationBooked(bookingWindow, l.id);
                      const checked = bookLocationIds.includes(l.id);
                      return (
                        <label key={l.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition ${
                          booked
                            ? 'border-slate-800 bg-slate-800/30 opacity-50 cursor-not-allowed'
                            : checked
                              ? 'border-indigo-500 bg-indigo-950/30 cursor-pointer'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-600 cursor-pointer'
                        }`}>
                          <input type="checkbox" checked={checked} disabled={booked} onChange={() => toggleBookLocation(l.id)}
                            className="h-3.5 w-3.5 accent-indigo-500" />
                          <div className="flex-1 min-w-0">
                            <span className="block text-xs font-semibold text-slate-200 truncate">{l.building} Rm {l.roomNumber}</span>
                            <span className="block text-[10px] text-slate-500 truncate">{l.roomNature}</span>
                          </div>
                          {booked && <span className="text-[9px] font-bold uppercase text-slate-500 shrink-0">Booked</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {bookDates.length > 0 && bookTimes.length > 0 && bookLocationIds.length > 0 && (
                <div className="p-3 bg-indigo-950/80 border border-indigo-500/30 rounded-lg text-[11px] text-indigo-200">
                  Booking <span className="font-bold">{bookLocationIds.length}</span> location(s) × <span className="font-bold">{bookDates.length}</span> date(s) × <span className="font-bold">{bookTimes.length}</span> time(s) = <span className="font-bold">{bookLocationIds.length * bookDates.length * bookTimes.length}</span> total inspection(s)
                </div>
              )}
              </>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setBookingWindowId(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={bookDates.length === 0 || bookTimes.length === 0 || bookLocationIds.length === 0}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-lg transition">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
