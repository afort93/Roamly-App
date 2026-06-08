import React from 'react';
import { User, CreditCard, Bookmark, Settings, Compass, Map, LogOut } from 'lucide-react';

const AccountPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-72 space-y-2 shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-black">
                RE
              </div>
              <div>
                <h3 className="font-black text-gray-900 leading-tight">Roamly Explorer</h3>
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
            
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-black text-sm text-red-500 hover:bg-red-50 transition-all mt-8">
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </nav>
        </aside>
        
        {/* Main Content */}
        <div className="flex-grow space-y-8">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Compass className="w-64 h-64 rotate-12" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center">
              Personal Information
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-10">
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <p className="text-xl font-black text-brand-teal">Roamly Explorer</p>
              </div>
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                <p className="text-xl font-black text-brand-teal">explorer@roamly.app</p>
              </div>
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Home Base</label>
                <p className="text-xl font-black text-brand-teal">San Francisco, CA</p>
              </div>
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Membership</label>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="bg-brand-teal/5 text-brand-teal px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-brand-teal/10">
                    Free Plan
                  </span>
                  <button className="text-brand-orange font-black text-xs hover:underline uppercase tracking-wider">
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </div>
            
            <button className="mt-12 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-gray-800 transition">
              Edit Profile
            </button>
          </div>

          {/* Activity Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-brand-teal uppercase tracking-tighter">Recent Trips</h3>
                <MapIcon className="w-6 h-6 text-brand-orange" />
              </div>
              <div className="space-y-4">
                {[10001, 90210].map(zip => (
                  <div key={zip} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-brand-teal/5 transition-colors cursor-pointer group border border-transparent hover:border-brand-teal/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <MapIcon className="w-6 h-6 text-brand-teal" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-brand-teal">Itinerary for {zip}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Saved 2 days ago</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-brand-orange transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-teal rounded-3xl p-8 shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-4 tracking-tighter">Go Pro</h3>
                <p className="font-medium text-brand-cream/80 text-sm leading-relaxed mb-8">
                  Unlock unlimited multi-day itineraries, offline access, and exclusive discounts at top-rated spots.
                </p>
              </div>
              <button className="w-full bg-brand-orange text-white py-5 rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-brand-orange/20 relative z-10 uppercase tracking-widest">
                Start 7-Day Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
