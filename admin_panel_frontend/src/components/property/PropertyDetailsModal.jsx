// src/components/cars/PropertyDetailsModal.jsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  MapPin,
  User,
  Mail,
  DollarSign,
  Building,
  Calendar,
  FileText,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

export function PropertyDetailsModal({ open, onOpenChange, property }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!property) return null;

  const allImages = [
    property.main_image,
    ...(property.images?.map(img => img.image_url || img) || [])
  ].filter(Boolean);

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {property.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.address}, {property.city}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="h-full">
          <TabsList className="w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images ({allImages.length})</TabsTrigger>
            {property.description && (
              <TabsTrigger value="description">Description</TabsTrigger>
            )}
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4">
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Property Information
                  </h3>
                  <DetailRow label="Status" value={property.status} badge />
                  <DetailRow label="Price" value={`$${property.price?.toLocaleString()}`} icon={DollarSign} />
                  <DetailRow label="City" value={property.city} />
                  <DetailRow label="Postal Code" value={property.postalCode} />
                  {property.createdAt && (
                    <DetailRow label="Created" value={new Date(property.createdAt).toLocaleDateString()} icon={Calendar} />
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Owner Information
                  </h3>
                  <DetailRow label="Name" value={property.owner_name} />
                  <DetailRow label="Email" value={property.owner_email} icon={Mail} />
                  
                  <div className="pt-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5" />
                      Address Details
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-700">{property.address}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {property.city}, {property.postalCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="images">
              {allImages.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {allImages[activeImageIndex] && (
                      <Image
                        src={allImages[activeImageIndex]}
                        alt={`Property image ${activeImageIndex + 1}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 1200px"
                      />
                    )}
                    
                    {allImages.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-xs rounded-full">
                          {activeImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </div>

                  {allImages.length > 1 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">All Images</h4>
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {allImages.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`relative aspect-square rounded-md overflow-hidden border-2 ${
                              index === activeImageIndex 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-transparent'
                            }`}
                          >
                            <Image
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="100px"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No images available</p>
                </div>
              )}
            </TabsContent>

            {property.description && (
              <TabsContent value="description">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Property Description
                  </h3>
                  <div className="prose max-w-none border rounded-lg p-4 bg-gray-50">
                    <div 
                      className="rich-text-content"
                      dangerouslySetInnerHTML={{ __html: property.description }}
                    />
                  </div>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value, icon: Icon, badge = false }) {
  if (badge) {
    return (
      <div className="flex justify-between items-center py-2">
        <span className="text-gray-600">{label}</span>
        <Badge className="capitalize">{value}</Badge>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-1">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        <span className="font-medium text-right">{value}</span>
      </div>
    </div>
  );
}