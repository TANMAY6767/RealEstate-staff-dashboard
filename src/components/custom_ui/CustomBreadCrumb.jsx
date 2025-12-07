"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function BreadcrumbWrapper({ pages }) {
  // Convert "Home,Dashboard,Settings" => ["Home","Dashboard","Settings"]
  const pageArray = pages.split(",").map((p) => p.trim());

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pageArray.map((page, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {index === pageArray.length - 1 ? (
                <BreadcrumbPage>{page}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={`/`}>
                  {page}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {index < pageArray.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
