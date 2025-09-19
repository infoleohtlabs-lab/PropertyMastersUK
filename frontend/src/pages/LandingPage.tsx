import React from 'react';
import { Button } from '../components/ui/Button';
import { Building2, Search, Users, TrendingUp, Shield, Clock, MapPin, Star, Heart, Share2, Eye, Calculator, Bed, Bath, Square, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect Property
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              The UK's most advanced property platform connecting buyers, sellers, tenants, and agents
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;