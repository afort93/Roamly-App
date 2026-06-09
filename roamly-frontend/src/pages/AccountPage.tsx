import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Bookmark, Settings, Compass, Map as MapIcon, LogOut, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useItineraryStore } from '../store/itineraryStore';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { savedItineraries, loadSavedItineraries, deleteItinerary, isLoading } = useItineraryStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadSavedItineraries();
  }, [isAuthenticated, loadSavedItineraries, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteItinerary(id);
      } catch (err) {
        alert('Failed to delete itinerary');
      }
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-72 space-y-2 shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-brand-teal rounded-full flex items-center justify-center text-white text-xl font-black uppercase">
                {user?.email?.[0] || 'U'}
              </div>
              <div className="text-left">
                <h3 className="font-black text-gray-900 leading-tight truncate w-32">{user?.email?.split('@')[0] || 'Explorer'}</h3>
                <p className="text-xs text-gray-500 font-bold">Member since 2024</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { icon: User, label: 'Profile', active: true },
              { icon: Bookmark, label: 'Saved Trips', active: false },
              { icon: CreditCard, label: 'Subscription', active: false },
              { icon: Settings, label: 'Settings', active: false },
            ].map((item) => (
              <button 
                key={item.label}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-black text-sm transition-all ${
                  item.active 
                    ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20' 
                    : 'text-gray-500 hover:bg-white hover:text-brand-teal'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-black text-sm text-red-500 hover:bg-red-50 transition-all mt-8"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </nav>
        </aside>
        
        {/* Main Content */}
        <div className="flex-grow space-y-8 w-full">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Compass className="w-64 h-64 rotate-12" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center text-left">
              Personal Information
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-10">
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                <p className="text-xl font-black text-brand-teal">{user?.email}</p>
              </div>
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Membership</label>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="bg-brand-teal/5 text-brand-teal px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-brand-teal/10">
                    {user?.is_premium ? 'Pro Plan' : 'Free Plan'}
                  </span>
                  {!user?.is_premium && (
                    <button className="text-brand-orange font-black text-xs hover:underline uppercase tracking-wider">
                      Upgrade to Pro
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="grid md:grid-cols-1 gap-8">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-brand-teal uppercase tracking-tighter">Saved Trips</h3>
                <Bookmark className="w-6 h-6 text-brand-orange" />
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
                </div>
              ) : savedItineraries.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {savedItineraries.map((itinerary: any) => (
                    <div 
                      key={itinerary.id} 
                      onClick={() => navigate(`/itinerary/${itinerary.zip_code}`)}
                      className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-brand-teal/5 transition-colors cursor-pointer group border border-transparent hover:border-brand-teal/10"
                    >
                      <div className="flex items-center space-x-4 overflow-hidden">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow shrink-0">
                          <MapIcon className="w-6 h-6 text-brand-teal" />
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className="font-black text-brand-teal truncate">{itinerary.name}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            Zip: {itinerary.zip_code} • {itinerary.items?.length || 0} stops
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => handleDelete(e, itinerary.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          title="Delete Trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-brand-orange transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-400 font-bold">You haven't saved any trips yet.</p>
                  <button 
                    onClick={() => navigate('/')}
                    className="mt-4 text-brand-teal font-black hover:underline uppercase tracking-widest text-sm"
                  >
                    Start Exploring
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
