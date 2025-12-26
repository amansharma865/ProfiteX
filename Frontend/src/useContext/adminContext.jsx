import React, { createContext, useContext } from "react";

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ value, children }) => {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
