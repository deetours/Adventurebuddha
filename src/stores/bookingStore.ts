import { create } from 'zustand';
import type { SeatMap, SeatStatus } from '../lib/types';

interface BookingState {
  // Seat Selection State
  selectedSeats: string[];
  seatMap: SeatMap | null;
  seatStatus: SeatStatus;
  lockToken: string | null;
  lockExpiry: Date | null;
  
  // Actions
  selectSeat: (seatId: string) => void;
  deselectSeat: (seatId: string) => void;
  clearSelection: () => void;
  setSeatMap: (seatMap: SeatMap) => void;
  updateSeatStatus: (status: Partial<SeatStatus>) => void;
  setLockToken: (token: string, expirySeconds: number) => void;
  clearLockToken: () => void;
  
  // WebSocket updates
  handleSeatUpdate: (event: string, seatId: string) => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedSeats: [],
  seatMap: null,
  seatStatus: {
    available: [],
    locked: [],
    booked: [],
    blocked: [],
    selected: [],
  },
  lockToken: null,
  lockExpiry: null,
  
  selectSeat: (seatId: string) => {
    const { selectedSeats, seatStatus } = get();
    
    // Check if seat is available for selection
    if (
      seatStatus.booked.includes(seatId) ||
      seatStatus.blocked.includes(seatId) ||
      (seatStatus.locked.includes(seatId) && !selectedSeats.includes(seatId))
    ) {
      return;
    }
    
    if (!selectedSeats.includes(seatId)) {
      set(state => ({
        selectedSeats: [...state.selectedSeats, seatId],
        seatStatus: {
          ...state.seatStatus,
          selected: [...state.seatStatus.selected, seatId],
          available: state.seatStatus.available.filter(id => id !== seatId),
        }
      }));
    }
  },
  
  deselectSeat: (seatId: string) => {
    set(state => ({
      selectedSeats: state.selectedSeats.filter(id => id !== seatId),
      seatStatus: {
        ...state.seatStatus,
        selected: state.seatStatus.selected.filter(id => id !== seatId),
        available: [...state.seatStatus.available, seatId],
      }
    }));
  },
  
  clearSelection: () => {
    const { selectedSeats, seatStatus } = get();
    set({
      selectedSeats: [],
      seatStatus: {
        ...seatStatus,
        selected: [],
        available: [...seatStatus.available, ...selectedSeats],
      }
    });
  },
  
  setSeatMap: (seatMap: SeatMap) => {
    set({ seatMap });
  },
  
  updateSeatStatus: (status: Partial<SeatStatus>) => {
    set(state => ({
      seatStatus: { ...state.seatStatus, ...status }
    }));
  },
  
  setLockToken: (token: string, expirySeconds: number) => {
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + expirySeconds);
    set({ lockToken: token, lockExpiry: expiry });
  },
  
  clearLockToken: () => {
    set({ lockToken: null, lockExpiry: null });
  },
  
  handleSeatUpdate: (event: string, seatId: string) => {
    const state = get();
    const newStatus = { ...state.seatStatus };
    
    // Remove from all arrays first
    Object.keys(newStatus).forEach(key => {
      newStatus[key as keyof SeatStatus] = newStatus[key as keyof SeatStatus].filter(
        (id: string) => id !== seatId
      );
    });
    
    // Add to appropriate array based on event
    switch (event) {
      case 'seat_locked':
        newStatus.locked.push(seatId);
        break;
      case 'seat_unlocked':
        newStatus.available.push(seatId);
        break;
      case 'seat_booked':
        newStatus.booked.push(seatId);
        break;
    }
    
    set({ seatStatus: newStatus });
  },
}));