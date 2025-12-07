"use client";

import { withRouteGuard } from "@/components/RouteGuard";
import { ServicesSection } from "@/components/website-services/ServicesSection";

function Services() {
  return (
    <div>
      <ServicesSection/>
    </div>
  );
}

export default withRouteGuard(Services, "read");
