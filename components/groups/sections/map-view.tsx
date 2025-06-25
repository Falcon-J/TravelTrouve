"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, ImageIcon, Loader2 } from "lucide-react";
import type { Group } from "@/types/group";
import type { Photo } from "@/types/photo";
import { getGroupPhotos } from "@/lib/firebase-utils";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapViewProps {
  group: Group;
}

export function MapView({ group }: MapViewProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v10",
      center: [-74.5, 40],
      zoom: 2,
    });
    mapRef.current = map;

    // Load photos with locations
    const loadPhotos = async () => {
      try {
        const groupPhotos = await getGroupPhotos(group.id);
        const photosWithLocation = groupPhotos.filter(
          (photo) => photo.location
        );
        setPhotos(photosWithLocation);

        // Add markers for each photo
        photosWithLocation.forEach((photo) => {
          if (photo.location) {
            const marker = new mapboxgl.Marker()
              .setLngLat([photo.location.lng, photo.location.lat])
              .setPopup(
                new mapboxgl.Popup().setHTML(`
                <img src="${
                  photo.thumbnail
                }" alt="" class="w-32 h-32 object-cover rounded-lg" />
                <p class="mt-2 text-sm">${photo.description || ""}</p>
              `)
              )
              .addTo(map);
            markersRef.current[photo.id] = marker;
          }
        });

        // Fit bounds to show all markers
        const bounds = new mapboxgl.LngLatBounds();
        photosWithLocation.forEach((photo) => {
          if (photo.location) {
            bounds.extend([photo.location.lng, photo.location.lat]);
          }
        });
        map.fitBounds(bounds, { padding: 50 });
      } catch (error) {
        console.error("Error loading photos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [group.id]);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Map View</h1>
        <p className="text-gray-400">Explore photos by location</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-lg bg-gray-900 border-gray-800 overflow-hidden">
            {loading ? (
              <div className="relative h-96 lg:h-[600px] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div id="map" className="relative h-96 lg:h-[600px]">
                <div className="text-center text-gray-400">
                  <Navigation className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Interactive Map
                  </h3>
                  <p className="text-gray-500">
                    Photos with location data will appear here
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    (Map integration ready for implementation)
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl shadow-lg bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <ImageIcon className="mr-2 h-5 w-5" />
                Photo Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  No photos with location data yet
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
