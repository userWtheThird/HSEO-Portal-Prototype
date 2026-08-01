import React, { useState } from 'react';
import { CalendarClock, Plus, X, Check, Lock, Unlock, ChevronRight, Clock, MapPin } from 'lucide-react';
import { InspectionWindow, InspectionBooking, User as AppUser, Location, Person, Inspection } from '../types';

interface InspectionBookingTabProps {
  currentUser: AppUser;
  windows: InspectionWindow[];
  locations: Location[];
  persons: Person[];
  onAddWindow: (w: InspectionWindow) => void;
  onUpdateWindow: (w: InspectionWindow) => void;
  onAddInspection: (inspection: Inspection, logDetails: string) => void;
}

const DEFAULT_TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

// Determine if user is FTM/staff who can manage windows
const canManageWindows = (role: string) =>
  ['superadmin', 'admin', 'FTM', 'inspector'].includes(role);

export default function InspectionBookingTab({
  currentUser, windows, locations, persons,
  onAddWindow, onUpdateWindow, onAddInspection
}: InspectionBookingTabProps) {
  const isManager = canManageWindows(currentUser.role);

  // FTM: Create window form
  const [showCreate, setShowCreate] = useState(false);
  const [cwDept, setCwDept] = useState('');
  const [cwTitle, setCwTitle] = useState('');
  const [cwStart, setCwStart] = useState('');
  const [cwEnd, setCwEnd] = useState('');
  const [cwSlots, setCwSlots] = useState<string[]>(DEFAULT_TIME_SLOTS);
  const [cwCustomSlot, setCwCustomSlot] = useState('');

  // Department user: booking form
  const [bookingWindowId, setBookingWindowId] = useState<string | null>(null);
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookLocationId, setBookLocationId] = useState('');

  // Current user's person record & department
  const currentPerson = persons.find(p => p.name === currentUser.name || p.id === currentUser.id);
  const userDepartment = currentPerson?.department || '';

  // Departments list
  const allDepartments = Array.from(new Set(locations.map(l => l.department))).filter(Boolean).sort();

  // Windows visible to department user (their department)
  const myWindows = isManager
    ? windows
    : windows.filter(w => w.department === userDepartment);

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

  // --- FTM: Create window ---
  const handleCreateWindow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cwDept || !cwStart || !cwEnd) return;
    const title = cwTitle || `Inspection Week: ${cwStart} to ${cwEnd}`;
    const newWindow: InspectionWindow = {
      id: 'iwin_' + Date.now(),
      department: cwDept,
      title,
      startDate: cwStart,
      endDate: cwEnd,
      timeSlots: cwSlots.length > 0 ? cwSlots : DEFAULT_TIME_SLOTS,
      openedBy: currentUser.name,
      openedById: currentUser.id,
      status: 'open',
      bookings: []
    };
    onAddWindow(newWindow);
    setShowCreate(false);
    setCwTitle(''); setCwStart(''); setCwEnd(''); setCwDept(''); setCwSlots(DEFAULT_TIME_SLOTS);
  };

  const toggleWindowStatus = (w: InspectionWindow) => {
    onUpdateWindow({ ...w, status: w.status === 'open' ? 'closed' : 'open' });
  };

  const addCustomSlot = () => {
    if (cwCustomSlot && !cwSlots.includes(cwCustomSlot)) {
      setCwSlots([...cwSlots, cwCustomSlot].sort());
      setCwCustomSlot('');
    }
  };

  // --- Department user: Book a slot ---
  const bookingWindow = windows.find(w => w.id === bookingWindowId);
  const bookingDates = bookingWindow ? getDatesInRange(bookingWindow.startDate, bookingWindow.endDate) : [];

  // Check if a slot is already taken
  const isSlotTaken = (w: InspectionWindow, date: string, time: string) =>
    w.bookings.some(b => b.date === date && b.time === time);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingWindow || !bookDate || !bookTime || !bookLocationId) return;

    const loc = locations.find(l => l.id === bookLocationId);
    const booking: InspectionBooking = {
      id: 'ibk_' + Date.now(),
      date: bookDate,
      time: bookTime,
      locationId: bookLocationId,
      bookedBy: currentPerson?.id || currentUser.id,
      bookedByName: currentUser.name
    };

    // Create the inspection record
    const newInsp: Inspection = {
      id: 'insp_' + Date.now(),
      title: `${loc?.building || ''} Rm ${loc?.roomNumber || ''} — Scheduled Inspection`,
      date: bookDate,
      inspectorId: bookingWindow.openedById,
      inspectorName: bookingWindow.openedBy,
      ftmId: bookingWindow.openedById,
      status: 'pending',
      inspectionStatus: 'scheduled',
      inspectionType: 'scheduled',
      department: bookingWindow.department,
      score: 100,
      findings: [],
      locationId: bookLocationId,
      scheduledMonth: `${new Date(bookDate).toLocaleString('en', { month: 'long' })} ${new Date(bookDate).getFullYear()}`,
      appointmentDate: bookDate
    };

    booking.inspectionId = newInsp.id;
    onAddInspection(newInsp, `Inspection booked by ${currentUser.name} for ${loc?.building} Rm ${loc?.roomNumber} on ${bookDate} at ${bookTime}`);
    onUpdateWindow({ ...bookingWindow, bookings: [...bookingWindow.bookings, booking] });

    setBookingWindowId(null);
    setBookDate(''); setBookTime(''); setBookLocationId('');
  };

  // Locations available for booking (in the window's department, restricted to user's associated locations)
  const bookingLocations = bookingWindow
    ? locations.filter(l => {
        if (l.department !== bookingWindow.department || l.status !== 'Active') return false;
        // Managers can book any location in the department
        if (isManager) return true;
        // Department users can only book locations they are associated with (PI or delegate)
        const pid = currentPerson?.id;
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
            {isManager
              ? 'Open a booking window for departments to schedule their inspection date & time.'
              : `Booking inspection slots for ${userDepartment}. Choose an available date and time.`}
          </p>
        </div>
        {isManager && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition">
            <Plus className="h-4 w-4" /> Open Booking Window
          </button>
        )}
      </div>

      {/* Open Windows */}
      {openWindows.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Open for Booking</span>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {openWindows.map(w => {
              const dates = getDatesInRange(w.startDate, w.endDate);
              const totalSlots = dates.length * w.timeSlots.length;
              const takenSlots = w.bookings.length;
              return (
                <div key={w.id} className="bg-slate-900 border border-emerald-900/30 rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{w.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{w.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isManager && (
                        <button onClick={() => toggleWindowStatus(w)} title="Close window"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 transition">
                          <Lock className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border bg-emerald-950/40 text-emerald-300 border-emerald-900/30">
                        <Unlock className="h-3 w-3" /> Open
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5 text-indigo-400" /> {w.startDate} → {w.endDate}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-500" /> {w.timeSlots.join(', ')}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Opened by {w.openedBy}</span>
                    <span className="font-mono">{takenSlots}/{totalSlots} slots booked</span>
                  </div>

                  {/* Bookings list */}
                  {w.bookings.length > 0 && (
                    <div className="border-t border-slate-800 pt-2 space-y-1">
                      {w.bookings.map(b => {
                        const loc = locations.find(l => l.id === b.locationId);
                        return (
                          <div key={b.id} className="flex items-center gap-2 text-[10px] text-slate-400">
                            <Check className="h-3 w-3 text-emerald-300 shrink-0" />
                            <span className="text-slate-300 font-semibold">{b.date} {b.time}</span>
                            <span>— {loc ? `${loc.building} Rm ${loc.roomNumber}` : 'Unknown'}</span>
                            <span className="text-slate-600">({b.bookedByName})</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Book button for department users */}
                  {!isManager && (
                    <button onClick={() => { setBookingWindowId(w.id); setBookLocationId(bookingLocations[0]?.id || ''); }}
                      className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">
                      Book a Slot
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {openWindows.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <CalendarClock className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{isManager ? 'No open booking windows. Create one to let departments schedule inspections.' : 'No booking windows available for your department yet.'}</p>
        </div>
      )}

      {/* Closed / Past Windows */}
      {closedWindows.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Closed Windows</span>
          <div className="space-y-2">
            {closedWindows.map(w => (
              <div key={w.id} className="bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-3.5 w-3.5 text-slate-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-400">{w.title}</span>
                    <span className="text-[10px] text-slate-600 block">{w.department} — {w.startDate} to {w.endDate} — {w.bookings.length} bookings</span>
                  </div>
                </div>
                {isManager && (
                  <button onClick={() => toggleWindowStatus(w)}
                    className="text-[10px] text-emerald-300 hover:text-emerald-200 font-bold transition">Re-open</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== CREATE WINDOW MODAL (FTM) ===== */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-slate-900 border border-indigo-600/30 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-indigo-400" /> Open Booking Window
              </h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleCreateWindow} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Department *</label>
                <select value={cwDept} onChange={e => setCwDept(e.target.value)} required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                  <option value="">Select department...</option>
                  {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Title (optional)</label>
                <input value={cwTitle} onChange={e => setCwTitle(e.target.value)} placeholder="e.g. Inspection Week — Aug 4 to 8"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Start Date *</label>
                  <input type="date" value={cwStart} onChange={e => setCwStart(e.target.value)} required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">End Date *</label>
                  <input type="date" value={cwEnd} onChange={e => setCwEnd(e.target.value)} required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>

              {/* Preview dates */}
              {cwStart && cwEnd && (
                <div className="p-2 bg-slate-800/40 rounded-lg text-[10px] text-slate-400">
                  Available days (weekdays): {getDatesInRange(cwStart, cwEnd).length} days
                  <span className="text-slate-500 ml-2">({getDatesInRange(cwStart, cwEnd).join(', ')})</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Time Slots</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {cwSlots.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                      {s}
                      <button type="button" onClick={() => setCwSlots(cwSlots.filter(x => x !== s))} className="text-slate-500 hover:text-rose-300"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="time" value={cwCustomSlot} onChange={e => setCwCustomSlot(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none" />
                  <button type="button" onClick={addCustomSlot}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-semibold transition">Add</button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg transition">Open Window</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Your Location *</label>
                <select value={bookLocationId} onChange={e => setBookLocationId(e.target.value)} required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                  <option value="">Select location...</option>
                  {bookingLocations.map(l => <option key={l.id} value={l.id}>{l.building} Rm {l.roomNumber} ({l.roomNature})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Date *</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {bookingDates.map(d => {
                    const dayName = new Date(d).toLocaleString('en', { weekday: 'short' });
                    const dayNum = new Date(d).getDate();
                    const monthShort = new Date(d).toLocaleString('en', { month: 'short' });
                    return (
                      <button key={d} type="button" onClick={() => { setBookDate(d); setBookTime(''); }}
                        className={`py-2 px-1 rounded-lg text-center border transition ${
                          bookDate === d
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

              {bookDate && (
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Time *</label>
                  <div className="flex flex-wrap gap-2">
                    {bookingWindow.timeSlots.map(t => {
                      const taken = isSlotTaken(bookingWindow, bookDate, t);
                      return (
                        <button key={t} type="button" disabled={taken}
                          onClick={() => setBookTime(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                            taken
                              ? 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed line-through'
                              : bookTime === t
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

              {bookDate && bookTime && (
                <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg text-[11px] text-indigo-200">
                  Booking: <span className="font-bold">{bookDate}</span> at <span className="font-bold">{bookTime}</span>
                  {bookLocationId && <span> — {locations.find(l => l.id === bookLocationId)?.building} Rm {locations.find(l => l.id === bookLocationId)?.roomNumber}</span>}
                </div>
              )}
              </>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setBookingWindowId(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={!bookDate || !bookTime || !bookLocationId}
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
