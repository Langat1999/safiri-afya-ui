import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Phone, Clock, Loader2, Hospital, Cross, Calendar } from "lucide-react";
import { toast } from "sonner";
import { fetchNearbyHealthFacilities, geocodeAddress, type HealthFacility } from "@/services/overpassAPI";
import { Coordinates } from "@/utils/geoUtils";
import { BookingModal } from "@/components/BookingModal";
import { PaymentModal } from "@/components/PaymentModal";
import { clinicsAPI } from "@/services/api";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ClinicLocatorProps {
  language: 'en' | 'sw';
}

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different facility types
const createCustomIcon = (type: HealthFacility['type']) => {
  const colors: Record<HealthFacility['type'], string> = {
    hospital: '#ef4444',
    clinic: '#3b82f6',
    doctors: '#8b5cf6',
    pharmacy: '#10b981',
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${colors[type]};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 16px; font-weight: bold;">
          ${type === 'hospital' ? '🏥' : type === 'pharmacy' ? '💊' : '⚕️'}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle map centering
function MapController({ center }: { center: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
}

export const ClinicLocator = ({ language }: ClinicLocatorProps) => {
  const [location, setLocation] = useState("");
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates>({ lat: -1.286389, lng: 36.817223 }); // Default to Nairobi
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: -1.286389, lng: 36.817223 });
  const [mapZoom, setMapZoom] = useState(13);

  // Booking and Payment State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
  const [currentBooking, setCurrentBooking] = useState<any | null>(null);

  // Try to get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(coords);
          setMapCenter(coords);
          loadNearbyFacilities(coords);
        },
        (error) => {
          console.log('Geolocation not available, using default location (Nairobi)');
          // Silently fail and use default Nairobi location
        }
      );
    }
  }, []);

  // Load nearby facilities from both OpenStreetMap and backend
  const loadNearbyFacilities = async (coords: Coordinates, radius: number = 5000) => {
    setIsLoading(true);
    try {
      // Fetch from both sources in parallel
      const [osmData, backendClinics] = await Promise.all([
        fetchNearbyHealthFacilities(coords.lat, coords.lng, radius).catch(() => []),
        clinicsAPI.getNearby(coords.lat, coords.lng, radius / 1000).catch(() => []), // Convert to km
      ]);

      // Merge and deduplicate facilities
      const allFacilities = [...backendClinics, ...osmData];
      setFacilities(allFacilities);

      if (allFacilities.length === 0) {
        toast.info(language === 'en'
          ? "No healthcare facilities found nearby. Try increasing search radius."
          : "Hakuna vituo vya afya vimepatikana karibu. Jaribu kuongeza umbali wa utafutaji.");
      } else {
        const backendCount = backendClinics.length;
        const message = language === 'en'
          ? `Found ${allFacilities.length} healthcare facilities${backendCount > 0 ? ` (${backendCount} with online booking)` : ''}`
          : `Vituo ${allFacilities.length} vya afya vimepatikana${backendCount > 0 ? ` (${backendCount} na ratiba mtandaoni)` : ''}`;
        toast.success(message);
      }
    } catch (error) {
      toast.error(language === 'en'
        ? "Failed to load healthcare facilities"
        : "Imeshindwa kupakia vituo vya afya");
      console.error('Error loading facilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const content = {
    en: {
      title: "Find Nearby Healthcare Facilities",
      description: "Real-time data from OpenStreetMap",
      placeholder: "Enter location (e.g., Nairobi, Westlands) or use your location",
      useLocation: "Use My Location",
      search: "Search",
      distance: "Distance",
      type: "Type",
      hours: "Hours",
      call: "Call",
      getDirections: "Get Directions",
      bookAppointment: "Book Appointment",
      loading: "Loading facilities...",
      noResults: "No facilities found",
      hospital: "Hospital",
      clinic: "Clinic",
      doctors: "Doctor's Office",
      pharmacy: "Pharmacy",
      consultationFee: "Consultation Fee",
    },
    sw: {
      title: "Tafuta Vituo vya Afya Karibu",
      description: "Data ya wakati halisi kutoka OpenStreetMap",
      placeholder: "Ingiza eneo (mfano, Nairobi, Westlands) au tumia mahali ulipo",
      useLocation: "Tumia Mahali Pangu",
      search: "Tafuta",
      distance: "Umbali",
      type: "Aina",
      hours: "Masaa",
      call: "Piga Simu",
      getDirections: "Pata Maelekezo",
      bookAppointment: "Ratiba Miadi",
      loading: "Inapakia vituo...",
      noResults: "Hakuna vituo vimepatikana",
      hospital: "Hospitali",
      clinic: "Kliniki",
      doctors: "Ofisi ya Daktari",
      pharmacy: "Duka la Dawa",
      consultationFee: "Ada ya Mahojiano",
    },
  };

  const t = content[language];

  // Handle booking creation
  const handleBookAppointment = (facility: any) => {
    setSelectedFacility(facility);
    setBookingModalOpen(true);
  };

  // Handle booking created - show payment modal
  const handleBookingCreated = (booking: any) => {
    setCurrentBooking(booking);
    setPaymentModalOpen(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = () => {
    toast.success(
      language === 'en' ? 'Appointment Confirmed!' : 'Miadi Imethibitishwa!',
      {
        description: language === 'en'
          ? 'Your consultation appointment has been confirmed and paid for.'
          : 'Miadi yako ya mahojiano imethibitishwa na imelipwa.',
      }
    );
    setCurrentBooking(null);
    setSelectedFacility(null);
  };

  const getFacilityTypeName = (type: HealthFacility['type']) => {
    const typeNames = {
      hospital: t.hospital,
      clinic: t.clinic,
      doctors: t.doctors,
      pharmacy: t.pharmacy,
    };
    return typeNames[type];
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(coords);
          setMapCenter(coords);
          setMapZoom(14);
          setLocation(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
          loadNearbyFacilities(coords);
        },
        (error) => {
          setIsLoading(false);
          toast.error(language === 'en'
            ? "Unable to get your location. Please enable location services."
            : "Haiwezi kupata mahali pako. Tafadhali ruhusu huduma za mahali.");
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error(language === 'en'
        ? "Geolocation not supported by your browser"
        : "Kivinjari chako hakitegemezi geolocation");
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      toast.info(language === 'en'
        ? "Please enter a location or use your current location"
        : "Tafadhali ingiza eneo au tumia mahali ulipo");
      return;
    }

    setIsLoading(true);
    try {
      // Try to geocode the location
      const coords = await geocodeAddress(location);

      if (!coords) {
        toast.error(language === 'en'
          ? "Location not found. Please try a different search."
          : "Eneo halijapatikana. Tafadhali jaribu kutafuta tofauti.");
        setIsLoading(false);
        return;
      }

      setMapCenter(coords);
      setMapZoom(14);
      loadNearbyFacilities(coords);
    } catch (error) {
      setIsLoading(false);
      toast.error(language === 'en'
        ? "Failed to search location"
        : "Imeshindwa kutafuta eneo");
      console.error('Search error:', error);
    }
  };

  return (
    <section id="clinic-locator" className="py-20 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t.title}
            </h2>
            <p className="text-muted-foreground">
              {t.description}
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder={t.placeholder}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSearch} variant="default" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t.search}
            </Button>
            <Button onClick={handleUseLocation} variant="secondary" disabled={isLoading}>
              <Navigation className="w-4 h-4" />
              {t.useLocation}
            </Button>
          </div>

          {/* Interactive Map */}
          <div className="w-full h-64 sm:h-96 rounded-lg border-2 border-border overflow-hidden">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={mapCenter} />

              {/* User location marker */}
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  {language === 'en' ? 'Your Location' : 'Mahali Pako'}
                </Popup>
              </Marker>

              {/* Facility markers */}
              {facilities.map((facility) => (
                <Marker
                  key={facility.id}
                  position={[facility.coordinates.lat, facility.coordinates.lng]}
                  icon={createCustomIcon(facility.type)}
                >
                  <Popup>
                    <div className="space-y-2 min-w-[200px]">
                      <h3 className="font-bold text-base">{facility.name}</h3>
                      <p className="text-sm">
                        <strong>{t.type}:</strong> {getFacilityTypeName(facility.type)}
                      </p>
                      {facility.distanceText && (
                        <p className="text-sm">
                          <strong>{t.distance}:</strong> {facility.distanceText}
                        </p>
                      )}
                      {facility.address && (
                        <p className="text-sm">{facility.address}</p>
                      )}
                      {facility.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => window.open(`tel:${facility.phone}`, '_self')}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          {facility.phone}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full"
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.lat},${facility.coordinates.lng}`,
                            '_blank'
                          )
                        }
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        {t.getDirections}
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Facilities List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">
                  {t.loading}
                </p>
              </div>
            ) : facilities.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t.noResults}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {language === 'en'
                    ? 'Try using your current location or searching for a different area'
                    : 'Jaribu kutumia mahali ulipo au kutafuta eneo tofauti'}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  {language === 'en'
                    ? `Showing ${facilities.length} healthcare facilities`
                    : `Inaonyesha vituo ${facilities.length} vya afya`}
                </p>
                {facilities.map((facility) => (
                  <Card key={facility.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-xl flex items-center gap-2">
                            {facility.type === 'hospital' && <Hospital className="w-5 h-5 text-red-500" />}
                            {facility.type === 'pharmacy' && <Cross className="w-5 h-5 text-green-500" />}
                            {facility.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 text-sm flex-wrap">
                            <Badge variant="secondary">
                              {getFacilityTypeName(facility.type)}
                            </Badge>
                            {facility.distanceText && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {facility.distanceText}
                              </span>
                            )}
                            {facility.emergency && (
                              <Badge variant="destructive">
                                {language === 'en' ? 'Emergency' : 'Dharura'}
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {facility.address && (
                        <div className="text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {facility.address}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        {facility.openingHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {facility.openingHours}
                          </span>
                        )}
                        {facility.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {facility.phone}
                          </span>
                        )}
                      </div>

                      {/* Show consultation fee if available */}
                      {(facility as any).consultationFee && (
                        <div className="bg-primary/5 border border-primary/20 rounded-md p-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            {t.consultationFee}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            KES {(facility as any).consultationFee.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 pt-2">
                        {/* Book Appointment Button - only show for facilities with booking support */}
                        {(facility as any).consultationFee && (
                          <Button
                            variant="default"
                            className="w-full"
                            onClick={() => handleBookAppointment(facility)}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {t.bookAppointment}
                          </Button>
                        )}

                        {/* Call and Directions Row */}
                        <div className="flex gap-3">
                          {facility.phone && (
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => window.open(`tel:${facility.phone}`, '_self')}
                            >
                              <Phone className="w-4 h-4" />
                              {t.call}
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            className={facility.phone ? 'flex-1' : 'w-full'}
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.lat},${facility.coordinates.lng}`,
                                '_blank'
                              )
                            }
                          >
                            <Navigation className="w-4 h-4" />
                            {t.getDirections}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedFacility && (
        <BookingModal
          open={bookingModalOpen}
          onOpenChange={setBookingModalOpen}
          facility={selectedFacility}
          language={language}
          onBookingCreated={handleBookingCreated}
        />
      )}

      {/* Payment Modal */}
      {currentBooking && (
        <PaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          booking={currentBooking}
          language={language}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </section>
  );
};
