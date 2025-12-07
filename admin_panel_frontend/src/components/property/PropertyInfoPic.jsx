"use client";

import React, { useState, useRef } from "react";
import { ImageIcon, Download, FileText, X, Phone, MessageCircle, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "../ui/badge";
import { toPng } from "html-to-image";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import { checkPermission } from "@/helper/commonHelper";
export function CarInfoPic({ car }) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef(null);

  const formatPrice = (price, currency) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "symbol"
    }).format(price);
  };

  const handleDownloadImage = async (imageType = "png") => {
    if(!checkPermission("cars","download")){
      toast.error("You don't have permission to download in Cars Page")
      return;
    }
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#ffffff",
        quality: 0.95,
        pixelRatio: 2 // Higher resolution
      });

      const link = document.createElement("a");
      link.download = `${car.title.replace(/\s+/g, "_")}_card.${imageType}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error capturing image:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  const handleDownloadPdf = () => {
    // In a real implementation, this would generate or fetch a PDF
    alert("PDF download functionality would be implemented here");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        // First convert the card to an image
        const dataUrl = await toPng(cardRef.current, {
          backgroundColor: "#ffffff",
          quality: 0.9,
          pixelRatio: 2
        });

        // Convert data URL to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `${car.name.replace(/\s+/g, "_")}.png`, { type: blob.type });

        // Share the image
        await navigator.share({
          title: `${car.title} - ${car.address}`,
          text: `Check out this ${car.title} from RedAppleCars!`,
          files: [file]
        });
      } catch (error) {
        console.error("Error sharing:", error);
        handleDownloadImage(); // Fallback to download if sharing fails
      }
    } else {
      handleDownloadImage(); // Fallback to download if Web Share API not supported
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        title="View car image and details"
        onClick={() => setOpen(true)}
        className="h-8 w-8"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white p-0">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b">
            <div>
              <DialogTitle className="text-lg">Share Car Details</DialogTitle>
              <DialogDescription>Download or share this car information</DialogDescription>
            </div>
            {/* <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button> */}
          </DialogHeader>

          {/* Card that will be captured for download */}
          <div ref={cardRef} className="bg-white p-4 rounded-lg">
            {/* Header with logo */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mr-2">
                  <img
                    src="https://res.cloudinary.com/dcg8mpgar/image/upload/v1757176857/Untitled_design__1_-removebg-preview_rpdk9q.png"
                    alt="logo"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-lg">RedAppleCars</h2>
                  <p className="text-xs text-gray-500">Quality Pre-owned Vehicles</p>
                </div>
              </div>
              <Badge className="bg-green-600">Available</Badge>
            </div>

            {/* Main image */}
            <div className="mb-4 rounded-lg overflow-hidden">
              {car.main_image ? (
                <img src={car.main_image} alt={car.name} className="w-full h-60 object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-48 bg-gray-100 rounded-md">
                  <ImageIcon className="h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No image available</p>
                </div>
              )}
            </div>
            <div className="flex w-24 h-20 gap-1">
              {car?.images?.map((image, index) => (
                <img src={image.image_url} key={index} alt={`otherImage ${index}`} />
              ))}
            </div>

            {/* Car title */}
            <h1 className="text-xl font-bold mb-1">{car.name}</h1>
            <p className="text-gray-600 mb-4">{car.car_company}</p>

          

            {/* Key details */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {car.engine && (
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Engine</p>
                  <p className="text-sm font-medium">{car.engine}</p>
                </div>
              )}
              <div className="bg-gray-50 p-2 rounded">
                <text className="text-xs text-gray-600">Car ID: </text>
                <text className="text-sm font-medium">{car.property_index_id}</text>
              </div>
            </div>

            {/* Contact information */}
          

            {/* Footer with branding */}
            <div className="text-center text-xs text-gray-500 border-t pt-3">
              RedAppleCars • www.redapplecars.com • {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 p-4 border-t">
            

            <div className="flex gap-2 ">
              <Button
                onClick={() => handleDownloadImage("png")}
                variant="outline"
                className="bg-green-600 hover:bg-green-700 flex-1 flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                PNG
              </Button>
              <Button
                onClick={handleDownloadPdf}
                variant="outline"
                className="flex-1 flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
