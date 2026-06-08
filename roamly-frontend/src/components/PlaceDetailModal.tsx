import React from 'react';
import { X, Star, Clock, DollarSign, MapPin, Navigation } from 'lucide-react';

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
  description: string;
  image_url?: string;
}

interface PlaceDetailModalProps {
  place: Place;
  onClose: () => void;
}

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose }) => {
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-900" />
        </button>

        <div className="h-64 sm:h-80 w-full overflow-hidden shrink-0">
          <img 
            src={`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000`} 
            alt={place.name} 
            className="w-full h-full object-cover" 
          />
        </div>

        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest bg-brand-teal/5 px-3 py-1 rounded-md mb-2 inline-block">
                {place.category}
              </span>
              <h2 className="text-3xl font-black text-brand-teal leading-tight tracking-tight">{place.name}</h2>
            </div>
            <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-xl text-yellow-600 text-sm font-black border border-yellow-100 shrink-0 ml-4">
              <Star className="w-4 h-4 mr-1.5 fill-current" />
              {place.rating}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <div className="flex items-center bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
              <Clock className="w-4 h-4 mr-2 text-brand-teal" />
              {getDurationLabel(place.typical_duration)}
            </div>
            <div className="flex items-center bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
              <DollarSign className="w-4 h-4 mr-2 text-brand-orange" />
              {getPriceLabel(place.price_level)}
            </div>
            <div className="flex items-center bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
              <MapPin className="w-4 h-4 mr-2 text-brand-teal" />
              <span className="truncate max-w-[200px]">{place.address}</span>
            </div>
          </div>

          <div className="max-w-none mb-10 text-left">
            <p className="text-gray-500 leading-relaxed font-bold">
              Experience the best of {place.name}. Located in the heart of the area, this {place.category} offers a unique experience for visitors.
            </p>
            <p className="text-gray-400 leading-relaxed font-medium mt-4">
              Explore this top-rated {place.category.toLowerCase()} and discover why it's a favorite among locals and travelers alike. Roamly recommends spending at least {getDurationLabel(place.typical_duration)} here.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button className="flex-grow bg-brand-teal text-white px-8 py-5 rounded-2xl font-black flex items-center justify-center hover:opacity-90 transition shadow-xl shadow-brand-teal/20 uppercase tracking-widest text-xs">
              <Navigation className="w-5 h-5 mr-2" />
              Get Directions
            </button>
            <button className="flex-grow bg-white text-brand-teal border-2 border-gray-100 px-8 py-5 rounded-2xl font-black flex items-center justify-center hover:bg-gray-50 transition uppercase tracking-widest text-xs">
              Add to Saved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailModal;
