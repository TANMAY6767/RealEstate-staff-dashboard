"use client";
import { format } from "date-fns";

export default function CrudDetails({ car }) {
  const formatDate = (date) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMM yyyy, hh:mm a");
  };

  return (
    <div className="space-y-1 text-xs">
      <div className="flex flex-col">
        <span className="font-semibold text-blue-600">Created At: </span>
        <span className="text-white-800">{formatDate(car?.createdAt)}</span>
        <span className="block text-gray-500">by {car?.created_by?.name || "Unknown"}</span>
      </div>

      <div className="flex flex-col">
        <span className="font-semibold text-green-600">Updated At: </span>
        <span className="text-white-800">{formatDate(car?.updatedAt)}</span>
        <span className="block text-gray-500">by {car?.updated_by?.name || "Unknown"}</span>
      </div>
    </div>
  );
}
