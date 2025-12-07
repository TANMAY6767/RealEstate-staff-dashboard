"use client";
import React, { useState } from "react";
import { SecondaryHeader } from "..";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "../ui/badge";


import { Skeleton } from "@/components/ui/skeleton";
import SearchLoader from "@/components/custom_ui/SearchLoader";
import { useRouter } from "next/navigation";
import { CustomPagination } from "..";


export function ServicesSection({ isExpanded }) {
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSearching, setIsSearching] = useState(false);

  const router = useRouter();


  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  const dummyServices = [
      {
        id: "1",
        name: "Web Design",
        description: "Beautiful, responsive website designs.",
        mainImage: "/images/design.png",
      },
      {
        id: "2",
        name: "SEO Optimization",
        description: "Improve your  search engine rankings.",
        mainImage: "/images/seo.png",
      },
      {
        id: "3",
        name: "E-Commerce Setup",
        description: "Full online store setup and integration.",
        mainImage: "/images/ecommerce.png",
      }]

      const totalServices = dummyServices.length; 
      const services = dummyServices;

  const skeletonRows = Array.from({ length: itemsPerPage }, (_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="h-4 w-8 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20 bg-border" />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8 bg-border" />
          <Skeleton className="h-8 w-8 bg-border" />
          <Skeleton className="h-8 w-8 bg-border" />
          <Skeleton className="h-8 w-8 bg-border" />
        </div>
      </TableCell>
    </TableRow>
  ));

  return (
    <div className="w-full h-full">
      {isSearching && <SearchLoader />}
      <SecondaryHeader
        title="Website Services"
        searchPlaceholder="Search Services"
        buttonText="Create New Service"
        tooltipText="Create New Service"
        onButtonClick={() => {
          /* Handle create new service */
        }}
        onMobileButtonClick={() => {
          /* Handle create new service */
        }}
        onSearch={handleSearch}
      />
      <div className="px-1 flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          {loading ? (
            <Skeleton className="h-5 w-40 bg-border rounded-md" />
          ) : totalServices > 0 ? (
            <Badge className="bg-hoverBg">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, totalServices)} of{" "}
              {totalServices} services
            </Badge>
          ) : (
            <Badge className="bg-hoverBg">No services Found</Badge>
          )}
        </div>
      </div>

      <div className="mx-1 mt-6 rounded-md max-w-[99vw] border overflow-x-auto bg-tableBg">
        <Table className="min-w-[1200px] lg:min-w-full">
          <TableCaption className="mb-2">
            A list of website Services
          </TableCaption>
          <TableHeader className="bg-hoverBg text-left">
            <TableRow>
              <TableHead className="w-[90px]">Sr</TableHead>
              <TableHead className="w-[500px]">Name</TableHead>
              <TableHead className="w-[500px]">Description</TableHead>
              <TableHead className="w-[500px]">Main image</TableHead>
            </TableRow>
          </TableHeader>
                <TableBody>
        {loading
            ? skeletonRows
            : services.map((service, index) => (
                <TableRow key={service.id}>
                <TableCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>
                    <img
                    src={service.mainImage}
                    alt={service.name}
                    className="h-12 w-12 object-cover rounded-md"
                    />
                </TableCell>
                </TableRow>
      ))}
</TableBody>

        </Table>
      </div>
      {totalPages > 0 && (
        <div className="flex justify-between items-center mt-4">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="justify-end"
          />
        </div>
      )}

    </div>
  );
}
