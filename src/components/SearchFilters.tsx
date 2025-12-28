import { useState } from 'react';
import { Search, MapPin, Wallet, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Database-compatible values
const cities = ['Bangalore', 'Mumbai', 'Hyderabad', 'Noida', 'Chennai', 'Delhi', 'Pune'];
const roomTypes = ['1BHK', '2BHK', '3BHK', 'studio', 'pg', 'hostel', 'flat', 'villa'];
const budgetRanges = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { label: '₹2,000 - ₹3,500', min: 2000, max: 3500 },
  { label: '₹3,500 - ₹5,000', min: 3500, max: 5000 },
  { label: 'Above ₹5,000', min: 5000, max: Infinity },
];

interface SearchFiltersProps {
  onFilter: (filters: {
    location: string;
    budget: string;
    roomType: string;
    search: string;
  }) => void;
  variant?: 'hero' | 'page';
}

const SearchFilters = ({ onFilter, variant = 'page' }: SearchFiltersProps) => {
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [roomType, setRoomType] = useState('');
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    onFilter({ location, budget, roomType, search });
  };

  const handleReset = () => {
    setLocation('');
    setBudget('');
    setRoomType('');
    setSearch('');
    onFilter({ location: '', budget: '', roomType: '', search: '' });
  };

  const isHero = variant === 'hero';

  return (
    <div
      className={`${
        isHero
          ? 'bg-card/95 backdrop-blur-md shadow-lg rounded-2xl p-4 md:p-6'
          : 'bg-card border border-border rounded-xl p-4 md:p-6 shadow-card'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Search Input */}
        <div className="lg:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Location */}
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="h-11 bg-secondary border-border">
            <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {cities.map(city => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Budget */}
        <Select value={budget} onValueChange={setBudget}>
          <SelectTrigger className="h-11 bg-secondary border-border">
            <Wallet className="w-4 h-4 text-muted-foreground mr-2" />
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent>
            {budgetRanges.map(range => (
              <SelectItem key={range.label} value={range.label}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Room Type */}
        <Select value={roomType} onValueChange={setRoomType}>
          <SelectTrigger className="h-11 bg-secondary border-border">
            <Home className="w-4 h-4 text-muted-foreground mr-2" />
            <SelectValue placeholder="Room Type" />
          </SelectTrigger>
          <SelectContent>
            {roomTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search Button */}
        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1 h-11" variant={isHero ? 'hero' : 'default'}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          {(location || budget || roomType || search) && (
            <Button onClick={handleReset} variant="outline" className="h-11 px-3">
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
