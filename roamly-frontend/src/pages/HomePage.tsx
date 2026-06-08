import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';
import heroImage from '../assets/cover.jpg';

const HomePage: React.FC = () => {
  const [zip, setZip] = useState('');
  const navigate = useNavigate();
  const fetchItinerary = useItineraryStore((state) => state.fetchItinerary);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (zip.length >= 5) {
      await fetchItinerary(zip);
      navigate(`/itinerary/${zip}`);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <section 
        className="w-full relative py-32 px-4 text-center bg-brand-teal overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(4, 44, 52, 0.7), rgba(4, 44, 52, 0.7)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Explore the best <br /> around you.
          </h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto font-medium text-brand-cream opacity-90">
            Enter a zip code, discover hidden gems, and get a curated itinerary instantly.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
            <div className="flex items-center bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
              <MapPin className="text-brand-teal ml-4 w-6 h-6" />
              <input
                type="text"
                placeholder="Enter Zip Code"
                className="w-full px-4 py-4 text-gray-800 focus:outline-none font-bold text-lg"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                maxLength={5}
              />
              <button 
                type="submit"
                className="bg-brand-orange text-white px-8 py-4 rounded-xl font-black flex items-center hover:opacity-90 transition shadow-lg"
              >
                <Search className="w-5 h-5 mr-2 stroke-[3px]" />
                Go
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="max-w-6xl w-full py-24 px-4 grid md:grid-cols-3 gap-16 text-center">
        <div>
          <div className="bg-brand-teal/5 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 hover:rotate-0 transition-transform">
            <MapPin className="text-brand-teal w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black mb-4 text-brand-teal">Discover Gems</h3>
          <p className="text-gray-600 font-medium leading-relaxed">
            Find the best local spots ranked by real reviews and expert curation.
          </p>
        </div>
        <div>
          <div className="bg-brand-orange/5 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 -rotate-3 hover:rotate-0 transition-transform">
            <Search className="text-brand-orange w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black mb-4 text-brand-teal">Smart Filtering</h3>
          <p className="text-gray-600 font-medium leading-relaxed">
            Filter by budget, kid-friendliness, and travel distance with one tap.
          </p>
        </div>
        <div>
          <div className="bg-brand-teal/5 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-6 hover:rotate-0 transition-transform">
            <MapPin className="text-brand-teal w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black mb-4 text-brand-teal">Ready to Go</h3>
          <p className="text-gray-600 font-medium leading-relaxed">
            Get a day-by-day plan with visit durations and walking directions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
