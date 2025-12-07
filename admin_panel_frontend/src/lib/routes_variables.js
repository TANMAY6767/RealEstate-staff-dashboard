import {
  Home,
  IdCardLanyard,
  Building,
  Route,
  MessageCircleQuestionMark,
  UserRoundPen,
  CircleDollarSign,
  BellRing
} from "lucide-react";

export const navItems = [
  {
    icon: Home,
    label: "Home",
    href: "/",
    id: "home",
    pages: "Home"
  },
   {
    icon: Route,
    label: "Kanban Board",
    href: "/kanban",
    id: "kanban",
    pages: "Home, kanban"
  },
  {
    icon: Building,
    label: "Properties",
    href: "/property",
    id: "property",
    pages: "Home, Property"
  },
  {
    icon: CircleDollarSign,
    label: "Rent Collection",
    href: "/rent-collection",
    id: "rentcollection",
    pages: "Home, Rentcollection"
  },
  {
    icon: MessageCircleQuestionMark,
    label: "Tenant Queries",
    href: "/tenantq",
    id: "tenantq",
    pages: "Home, TenantQ"
  },
  {
    icon: IdCardLanyard,
    label: "Employees",
    href: "/user_management",
    id: "users",
    pages: "Home, Users"
  },
  {
    icon: UserRoundPen,
    label: "Roles",
    href: "/roles",
    id: "roles",
    pages: "Home, Roles"
  },
  
  {
    icon: BellRing,
    label: "Notifications",
    href: "/all-notifications",
    id: "all-notifications",
    pages: "Home, Notifications"
  }
];
