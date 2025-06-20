import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as api from '../services/api';
import './../styles/Map.css';

// Custom marker icon for Leaflet
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const blueMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const Map = () => {
    const [disasters, setDisasters] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [loadingHospitals, setLoadingHospitals] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedDisaster, setSelectedDisaster] = useState(null);
    const [mapCenter, setMapCenter] = useState([20, 0]); // Default center
    const [mapZoom, setMapZoom] = useState(2); // Default zoom

    useEffect(() => {
        const fetchInitialData = async () => {
            const disastersData = await api.fetchSupabaseDisasters();
            setDisasters(disastersData);
        };
        fetchInitialData();
        fetchUserLocation();
    }, []);

    const fetchUserLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
                setMapCenter([loc.lat, loc.lng]);
                setMapZoom(10);
            },
            err => console.warn(`ERROR(${err.code}): ${err.message}`)
          );
        }
      };

    const handleShowHospitals = async (disaster) => {
        setSelectedDisaster(disaster);
        setLoadingHospitals(true);
        const geo = await api.geocodeLocation(disaster.location_name);
        if(geo && geo.lat && geo.lng) {
            const hospitalData = await api.fetchHospitals(geo.lat, geo.lng);
            setHospitals(hospitalData.map(h => ({...h, lat: h.geometry.location.lat, lng: h.geometry.location.lng})));
            setMapCenter([geo.lat, geo.lng]);
            setMapZoom(13);
        } else {
            alert('Could not geocode disaster location.');
        }
        setLoadingHospitals(false);
    };

    return (
        <div className="map-section">
            <h2>Disaster and Resource Map</h2>
            <div className="map-controls">
                <p>Select a disaster to see nearby hospitals.</p>
                {disasters.map(d => (
                    <button key={d.id} onClick={() => handleShowHospitals(d)}>
                        Show Hospitals near "{d.title}"
                    </button>
                ))}
                {loadingHospitals && <p>Loading hospitals...</p>}
            </div>
            <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} className="map-container">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={blueMarkerIcon}>
                        <Popup>Your Location</Popup>
                    </Marker>
                )}
                {selectedDisaster && selectedDisaster.location?.coordinates && (
                     <Marker position={[selectedDisaster.location.coordinates[1], selectedDisaster.location.coordinates[0]]} icon={markerIcon}>
                        <Popup>{selectedDisaster.title}</Popup>
                    </Marker>
                )}
                {hospitals.map(h => (
                    <Marker key={h.place_id} position={[h.lat, h.lng]} icon={markerIcon}>
                        <Popup>{h.name}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map; 