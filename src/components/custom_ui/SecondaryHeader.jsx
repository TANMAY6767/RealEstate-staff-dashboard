"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomTooltip } from "..";
import { debounce } from "@/helper/zindex";
export function SecondaryHeader({
  title = "Roles",
  searchPlaceholder = "Search",
  buttonText = "Create New Role",
  tooltipText = "Add New",
  onSearch,
  onButtonClick,
  onMobileButtonClick,
}) {
  return (
    <div className="flex justify-between items-center sm:p-2 rounded-md">
      {/* Left Title */}
      <div className="hidden md:flex bg-hoverBg py-2 pl-4 pr-8 rounded-r-3xl">
        <span className="hidden md:flex text-black dark:text-white">
          {title}
        </span>
      </div>

      {/* Search Input */}
      <Input
        className="mx-2 w-[90%] md:w-[60%] border-border focus:outline-none focus:ring-0 focus:border-border"
        type="text"
        placeholder={searchPlaceholder}
        onChange={(e) => onSearch(e.target.value)}
      />

      {/* Desktop Button */}
      <Button className="hidden md:flex" onClick={onButtonClick}>
        {buttonText}
      </Button>

      {/* Mobile Button with Tooltip */}
      {/* <CustomTooltip
        tooltipText={tooltipText}
        buttonText={buttonText}
        onClick={onMobileButtonClick}
        className=""
      /> */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="flex md:hidden" onClick={onMobileButtonClick}>
              +
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <span>{tooltipText}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
