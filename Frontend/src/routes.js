import React from "react";

import MainDashboard from "views/user/default";
import Profile from "views/user/profile";
import DataTables from "views/user/tables";
import Inventory from "views/user/inventory";

import AdminMainDashboard from "views/admin/default";
import AdminProfile from "views/admin/profile";
import AdminDataTables from "views/admin/tables";

import SignIn from "views/auth/SignIn";
import SignUp from "views/auth/SignUp";

import {
  MdHome,
  MdBarChart,
  MdOutlineTableChart,
  MdPerson,
  MdDeck,
  MdLock,
} from "react-icons/md";
import InvoiceList from "views/user/invoice/InvoiceList";
import AdminInvoiceList from "views/admin/user/User";

const routes = [
  // User Routes
  {
    name: "Main Dashboard",
    layout: "/user",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
    roles: ["user"], // Accessible by "user" role
  },
  {
    name: "Order Tables",
    layout: "/user",
    icon: <MdBarChart className="h-6 w-6" />,
    path: "order-tables",
    component: <DataTables />,
    roles: ["user"],
  },
  {
    name: "Inventory",
    layout: "/user",
    icon: <MdDeck className="h-6 w-6" />,
    path: "inventory",
    component: <Inventory userRole="user" /> ,
    roles: ["user"],
  },
  {
    name: "Invoice",
    layout: "/user",
    icon: <MdOutlineTableChart className="h-6 w-6" />,
    path: "invoice",
    component: <InvoiceList />,
    roles: ["user"],
  },
  {
    name: "Profile",
    layout: "/user",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
    roles: ["user"],
  },
  {
    name: "Sign In",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLock className="h-6 w-6" />,
    component: <SignIn />,
    roles: ["user", "admin"], // Accessible by both "user" and "admin" roles
  },
  {
    name: "Sign Up",
    layout: "/auth",
    path: "sign-up",
    icon: <MdLock className="h-6 w-6" />,
    component: <SignUp />,
    roles: ["user", "admin"],
  },

  // Admin Routes
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <AdminMainDashboard />,
    roles: ["admin"], // Accessible by "admin" role
  },
  {
    name: "Order Tables",
    layout: "/admin",
    icon: <MdBarChart className="h-6 w-6" />,
    path: "order-tables",
    component: <AdminDataTables />,
    roles: ["admin"],
  },
  {
    name: "Super Inventory",
    layout: "/admin",
    icon: <MdDeck className="h-6 w-6" />,
    path: "superinventory",
    component: <Inventory userRole="admin" />,
    roles: ["admin"],
  },
  {
    name: "User",
    layout: "/admin",
    icon: <MdOutlineTableChart className="h-6 w-6" />,
    path: "user",
    component: <AdminInvoiceList />,
    roles: ["admin"],
  },
  {
    name: "Profile",
    layout: "/admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <AdminProfile />,
    roles: ["admin"],
  },
];

export default routes;
