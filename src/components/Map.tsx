'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TeamLocation {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  updated_at: string;
  name: string;
  role: string;
}

interface MapProps {
  locations: TeamLocation[];
}

export default function Map({ locations }: MapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Fix for default marker icons in React Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  if (!isClient) {
    return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div>;
  }

  // Default center (will be overridden if locations exist)
  const center = locations.length > 0 
    ? [locations[0].latitude, locations[0].longitude] as [number, number]
    : [20.5937, 78.9629] as [number, number]; // Default to India center

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <div className="text-sm">
              <strong>{location.name}</strong>
              <br />
              <span className="text-gray-600">Role: {location.role}</span>
              <br />
              <span className="text-gray-500">
                Last updated: {new Date(location.updated_at).toLocaleTimeString()}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
