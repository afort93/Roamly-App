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
  savedItineraries: any[];
  isLoading: boolean;
  error: string | null;
  filters: {
    categories: string[];
    maxPrice: number | null;
    kidFriendly: boolean;
  };
  setFilters: (filters: Partial<ItineraryStore['filters']>) => void;
  fetchItinerary: (zip: string, days?: number) => Promise<void>;
  saveItinerary: (name: string) => Promise<void>;
  loadSavedItineraries: () => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
}

export const useItineraryStore = create<ItineraryStore>((set, get) => ({
  zipCode: '',
  itinerary: [],
  savedItineraries: [],
  isLoading: false,
  error: null,
  filters: {
    categories: [],
    maxPrice: null,
    kidFriendly: false,
  },
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },
  fetchItinerary: async (zip, days = 1) => {
    const { filters } = get();
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('roamly_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params: any = { 
        zip_code: zip, 
        days 
      };

      if (filters.categories.length > 0) {
        params.categories = filters.categories.join(',');
      }
      if (filters.maxPrice !== null) {
        params.max_price = filters.maxPrice;
      }
      if (filters.kidFriendly) {
        params.kid_friendly = true;
      }

      const response = await axios.get(`/api/itinerary`, {
        params,
        headers
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

  saveItinerary: async (name) => {
    const { zipCode, itinerary } = get();
    const token = localStorage.getItem('roamly_token');
    if (!token) throw new Error('Auth required');

    // Flatten items for saving
    const items = itinerary.flatMap(day => 
      day.items.map((place, idx) => ({
        place_id: place.id,
        day: day.day,
        slot: idx + 1
      }))
    );

    try {
      await axios.post('/api/itineraries/save', {
        zip_code: zipCode,
        name,
        items
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await get().loadSavedItineraries();
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to save itinerary');
    }
  },

  loadSavedItineraries: async () => {
    const token = localStorage.getItem('roamly_token');
    if (!token) return;

    try {
      const response = await axios.get('/api/itineraries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ savedItineraries: response.data });
    } catch (err) {
      console.error('Failed to load saved itineraries', err);
    }
  },

  deleteItinerary: async (id) => {
    const token = localStorage.getItem('roamly_token');
    if (!token) return;

    try {
      await axios.delete(`/api/itineraries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set(state => ({
        savedItineraries: state.savedItineraries.filter(it => it.id !== id)
      }));
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete itinerary');
    }
  },
}));
