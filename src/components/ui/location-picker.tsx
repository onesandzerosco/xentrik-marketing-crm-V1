
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  timezone?: string;
}

interface LocationPickerProps {
  value: string;
  onChange: (location: string, coordinates?: { lat: number; lon: number }, timezone?: string) => void;
  placeholder?: string;
  className?: string;
  showCurrentTime?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Search for a location...",
  className = "",
  showCurrentTime = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update current time if timezone is available
  useEffect(() => {
    if (selectedTimezone && showCurrentTime) {
      const updateTime = () => {
        try {
          const now = new Date();
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: selectedTimezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
          setCurrentTime(formatter.format(now));
        } catch (error) {
          console.error('Error formatting time:', error);
          setCurrentTime('');
        }
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedTimezone, showCurrentTime]);

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Using Nominatim API (free OpenStreetMap geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      // Format the suggestions
      const formattedSuggestions: LocationSuggestion[] = data.map((item: any) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        place_id: item.place_id
      }));
      
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce the search
    timeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        searchLocations(query);
        setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);
  };

  const getTimezone = async (lat: number, lon: number): Promise<string | null> => {
    try {
      // Using a timezone API service (you might want to use a different service)
      const response = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=demo&format=json&by=position&lat=${lat}&lng=${lon}`
      );
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.zoneName;
      }
      
      // Fallback: try to guess timezone from coordinates
      // This is a simple fallback - you might want to use a more robust solution
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.error('Error fetching timezone:', error);
      return null;
    }
  };

  const handleSuggestionClick = async (suggestion: LocationSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    
    // Get timezone for the selected location
    const timezone = await getTimezone(lat, lon);
    
    setSearchTerm(suggestion.display_name);
    setSelectedTimezone(timezone);
    setIsOpen(false);
    setSuggestions([]);
    
    onChange(suggestion.display_name, { lat, lon }, timezone || undefined);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Search className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {showCurrentTime && currentTime && (
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Local time: {currentTime}</span>
        </div>
      )}
      
      {isOpen && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.place_id}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3 rounded-none border-b last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm break-words">{suggestion.display_name}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationPicker;
