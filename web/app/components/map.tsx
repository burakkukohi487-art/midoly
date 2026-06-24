"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css"
import { useState } from "react";
import LoadingSpinner from "./loadingSpinner";

export default function Map() {
    const [loading, setLoading] = useState(true);

    return (
        <div className="relative w-full h-full">
            <MapContainer center={[35.1706, 136.8816]} zoom={16} className="w-full h-full">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    eventHandlers={{ load: () => setLoading(false) }}
                />
            </MapContainer>
            {loading && (
                <div className="absolute inset-0 flex justify-center items-center bg-white">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    )
}