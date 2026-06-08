import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, Map as MapIcon, Clock, DollarSign, Star, ChevronRight, List, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useItineraryStore } from '../store/itineraryStore';
import PlaceDetailModal from '../components/PlaceDetailModal';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map center changes
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center);
  return null;
};

const ItineraryPage: React.FC = () => {
  const { zip } = useParams<{ zip: string }>();
  const [activeDay, setActiveDay] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);

  const { itinerary, isLoading, error, fetchItinerary } = useItineraryStore();

  useEffect(() => {
    if (zip && itinerary.length === 0) {
      fetchItinerary(zip);
    }
  }, [zip, itinerary.length, fetchItinerary]);

  const currentDayData = itinerary.find(d => d.day === activeDay) || itinerary[0];

  const getPriceLabel = (level: number) => {
    if (level === 0) return 'Free';
    return '$'.repeat(level);
  };

  const getDurationLabel = (mins: number) => {
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h${remainingMins > 0 ? ` ${remainingMins}m` : ''}`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50 h-[calc(100vh-64px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-teal animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-black">Curating your perfect itinerary...</p>
        </div>
      </div>
    );
  }

  if (error && itinerary.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50 h-[calc(100vh-64px)] p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md text-center">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapIcon className="text-red-500 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6 font-medium">{error}</p>
          <button 
            onClick={() => zip && fetchItinerary(zip)}
            className="bg-brand-teal text-white px-8 py-4 rounded-2xl font-black hover:opacity-90 transition w-full shadow-lg shadow-brand-teal/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get map center from the first place of the current day
  const mapCenter: [number, number] = currentDayData?.items?.[0] 
    ? [currentDayData.items[0].lat, currentDayData.items[0].lng] 
    : [40.7128, -74.0060];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar Filters */}
      <aside className={`lg:w-72 bg-white border-r border-gray-100 overflow-y-auto transition-all ${showFilters ? 'fixed inset-0 z-[60] p-6 lg:relative lg:inset-auto' : 'hidden lg:block'}`}>
        <div className="p-6 lg:p-0 lg:px-6 lg:py-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black flex items-center text-brand-teal uppercase tracking-tighter">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h2>
            <button className="lg:hidden text-gray-500" onClick={() => setShowFilters(false)}>✕</button>
          </div>
          
          <div className="space-y-10">
            <div>
              <h3 className="font-black mb-4 text-[10px] text-gray-400 uppercase tracking-[0.2em] text-left">Categories</h3>
              <div className="space-y-3">
                {['Restaurant', 'Shopping', 'Park', 'Museum', 'Landmark'].map(cat => (
                  <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                    <input type="checkbox" className="rounded-lg text-brand-teal focus:ring-brand-teal h-5 w-5 border-gray-200" />
                    <span className="text-gray-600 group-hover:text-brand-teal transition text-sm font-bold">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-black mb-4 text-[10px] text-gray-400 uppercase tracking-[0.2em] text-left">Price Range</h3>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(p => (
                  <button key={p} className="py-2 border border-gray-100 rounded-xl hover:border-brand-teal hover:text-brand-teal font-black transition text-xs">
                    {'$'.repeat(p)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-black mb-4 text-[10px] text-gray-400 uppercase tracking-[0.2em] text-left">Features</h3>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="rounded-lg text-brand-teal focus:ring-brand-teal h-5 w-5 border-gray-200" />
                <span className="text-gray-600 group-hover:text-brand-teal transition text-sm font-bold">Kid Friendly</span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden bg-gray-50">
        <header className="bg-white border-b border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 shrink-0 text-left">
          <div>
            <h1 className="text-2xl font-black text-brand-teal leading-tight tracking-tight">Itinerary for {zip}</h1>
            <p className="text-gray-400 text-sm font-bold">Showing top-ranked spots for your visit.</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-50 p-1 rounded-2xl border border-gray-100">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center px-5 py-2.5 rounded-xl transition text-sm font-black ${viewMode === 'list' ? 'bg-brand-teal shadow-lg shadow-brand-teal/20 text-white' : 'text-gray-400 hover:text-brand-teal'}`}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center px-5 py-2.5 rounded-xl transition text-sm font-black ${viewMode === 'map' ? 'bg-brand-teal shadow-lg shadow-brand-teal/20 text-white' : 'text-gray-400 hover:text-brand-teal'}`}
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Map
              </button>
            </div>

            <button className="lg:hidden flex items-center justify-center p-3 border border-gray-100 rounded-2xl bg-white shadow-sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-5 h-5 text-brand-teal" />
            </button>
          </div>
        </header>

        {/* Day Tabs */}
        {itinerary.length > 1 && (
          <div className="bg-white border-b border-gray-100 px-6 overflow-x-auto whitespace-nowrap shrink-0">
            <div className="flex space-x-10">
              {itinerary.map(day => (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(day.day)}
                  className={`py-5 px-1 font-black border-b-4 transition-all text-sm uppercase tracking-widest ${activeDay === day.day ? 'border-brand-orange text-brand-teal' : 'border-transparent text-gray-300 hover:text-gray-600'}`}
                >
                  Day {day.day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Scroll Area */}
        <div className="flex-grow overflow-y-auto p-6 scroll-smooth">
          {currentDayData && currentDayData.items.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === 'map' ? 'lg:grid-cols-2 h-full' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
              <div className="space-y-6 pb-12 text-left">
                {currentDayData.items.map((place, idx) => (
                  <div 
                    key={place.id} 
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row group hover:shadow-xl hover:border-brand-teal/20 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedPlace(place)}
                  >
                    <div className="sm:w-64 h-56 sm:h-auto overflow-hidden relative">
                      <div className="absolute top-4 left-4 bg-brand-orange px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg z-10">
                        STOP {idx + 1}
                      </div>
                      <img 
                        src={`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600`} 
                        alt={place.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                      />
                    </div>
                    <div className="p-8 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest bg-brand-teal/5 px-3 py-1 rounded-lg">
                            {place.category}
                          </span>
                          <div className="flex items-center text-yellow-500 text-sm font-black">
                            <Star className="w-4 h-4 mr-1 fill-current" />
                            {place.rating}
                          </div>
                        </div>
                        <h3 className="text-2xl font-black mb-2 group-hover:text-brand-teal transition-colors leading-tight">{place.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-6 font-medium">
                          Located at {place.address}. A top-ranked destination in the {zip} area.
                        </p>
                        <div className="flex flex-wrap gap-y-3 gap-x-6 text-xs font-bold text-gray-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-300" />
                            {getDurationLabel(place.typical_duration)}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-300" />
                            {getPriceLabel(place.price_level)}
                          </div>
                          <div className="flex items-center text-brand-teal">
                            <MapIcon className="w-4 h-4 mr-2" />
                            Recommended
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-brand-teal font-black text-[10px] uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">
                          View Details & Directions
                        </span>
                        <ChevronRight className="w-5 h-5 text-brand-teal" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {viewMode === 'map' && (
                <div className="hidden lg:block sticky top-0 h-full min-h-[500px] bg-gray-100 rounded-3xl overflow-hidden border-4 border-white shadow-xl z-0">
                  <MapContainer 
                    center={mapCenter} 
                    zoom={13} 
                    className="w-full h-full"
                    scrollWheelZoom={false}
                  >
                    <ChangeView center={mapCenter} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {currentDayData.items.map((place, i) => (
                      <Marker 
                        key={place.id} 
                        position={[place.lat, place.lng]}
                      >
                        <Popup>
                          <div className="p-1">
                            <p className="font-black text-brand-teal text-sm m-0">{place.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{place.category}</p>
                            <button 
                              onClick={() => setSelectedPlace(place)}
                              className="text-brand-orange text-xs font-black mt-3 hover:underline flex items-center uppercase tracking-widest"
                            >
                              View Details
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-gray-100 p-8 rounded-full mb-6">
                <MapIcon className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="text-2xl font-black text-brand-teal mb-2">No results found for {zip}</h2>
              <p className="text-gray-400 max-w-sm font-medium">We couldn't find any activities for this area. Try a major zip code like 10001 or 90210.</p>
            </div>
          )}
        </div>
      </main>

      {selectedPlace && (
        <PlaceDetailModal 
          place={selectedPlace} 
          onClose={() => setSelectedPlace(null)} 
        />
      )}
    </div>
  );
};

export default ItineraryPage;
