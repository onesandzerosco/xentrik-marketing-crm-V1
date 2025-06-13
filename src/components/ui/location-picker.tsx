
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

// Improved timezone detection using geographic inference
const getTimezoneFromCoordinates = (lat: number, lon: number): string => {
  // Major timezone boundaries (approximate)
  if (lat >= 60 && lon >= -180 && lon <= -120) return 'America/Anchorage'; // Alaska
  if (lat >= 25 && lat <= 50 && lon >= -125 && lon <= -114) return 'America/Los_Angeles'; // Pacific
  if (lat >= 25 && lat <= 50 && lon >= -114 && lon <= -104) return 'America/Denver'; // Mountain
  if (lat >= 25 && lat <= 50 && lon >= -104 && lon <= -87) return 'America/Chicago'; // Central
  if (lat >= 25 && lat <= 50 && lon >= -87 && lon <= -67) return 'America/New_York'; // Eastern
  
  // Europe
  if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) {
    if (lon >= -10 && lon <= 2) return 'Europe/London';
    if (lon >= 2 && lon <= 15) return 'Europe/Paris';
    if (lon >= 15 && lon <= 30) return 'Europe/Berlin';
    return 'Europe/Moscow';
  }
  
  // Asia
  if (lat >= 10 && lat <= 70 && lon >= 40 && lon <= 180) {
    if (lon >= 40 && lon <= 70) return 'Asia/Dubai';
    if (lon >= 70 && lon <= 90) return 'Asia/Kolkata';
    if (lon >= 90 && lon <= 120) return 'Asia/Shanghai';
    if (lon >= 120 && lon <= 140) return 'Asia/Tokyo';
    return 'Asia/Shanghai';
  }
  
  // Australia
  if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 155) {
    if (lon >= 110 && lon <= 130) return 'Australia/Perth';
    if (lon >= 130 && lon <= 145) return 'Australia/Adelaide';
    return 'Australia/Sydney';
  }
  
  // Africa
  if (lat >= -35 && lat <= 35 && lon >= -20 && lon <= 50) {
    return 'Africa/Cairo';
  }
  
  // South America
  if (lat >= -55 && lat <= 15 && lon >= -85 && lon <= -35) {
    if (lon >= -85 && lon <= -70) return 'America/Lima';
    if (lon >= -70 && lon <= -50) return 'America/Sao_Paulo';
    return 'America/Argentina/Buenos_Aires';
  }
  
  // Default fallback
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

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

  const handleSuggestionClick = async (suggestion: LocationSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    
    // Get timezone using geographic inference
    const timezone = getTimezoneFromCoordinates(lat, lon);
    
    setSearchTerm(suggestion.display_name);
    setSelectedTimezone(timezone);
    setIsOpen(false);
    setSuggestions([]);
    
    onChange(suggestion.display_name, { lat, lon }, timezone);
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
