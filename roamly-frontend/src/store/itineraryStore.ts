import { create } from 'zustand';
import axios from 'axios';

interface Place {
  id: string;
  name: string;
  category: string;
  rating: number;
  price_level: number;
  lat: number;
  lng: number;
  address: string;
  typical_duration: number;
}

interface ItineraryDay {
  day: number;
  items: Place[];
}

interface ItineraryStore {
  zipCode: string;
  itinerary: ItineraryDay[];
  isLoading: boolean;
  error: string | null;
  fetchItinerary: (zip: string, days?: number) => Promise<void>;
}

export const useItineraryStore = create<ItineraryStore>((set) => ({
  zipCode: '',
  itinerary: [],
  isLoading: false,
  error: null,
  fetchItinerary: async (zip, days = 1) => {
    set({ isLoading: true, error: null });
    try {
      // Use relative URL - Vite proxy handles this in dev
      const response = await axios.get(`/api/itinerary`, {
        params: { zip_code: zip, days }
      });
      set({ 
        itinerary: response.data.itinerary, 
        zipCode: zip, 
        isLoading: false 
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.detail || 'Failed to fetch itinerary', 
        isLoading: false 
      });
    }
  },
}));
