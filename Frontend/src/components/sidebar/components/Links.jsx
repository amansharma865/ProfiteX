// /* eslint-disable */
// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import DashIcon from "components/icons/DashIcon";
// // chakra imports

// export function SidebarLinks(props) {
//   // Chakra color mode
//   let location = useLocation();

//   const { routes,role } = props;

//   // verifies if routeName is the one active (in browser input)
//   const activeRoute = (routeName) => {
//     return location.pathname.includes(routeName);
//   };

//   const createLinks = (routes) => {
//     return routes.map((route, index) => {
//       if (
//         route.layout === "/user" ||
//         route.layout === "/admin"
//       ) {
//         return (
//           <Link key={index} to={route.layout + "/" + route.path}>
//             <div className="relative mb-3 flex hover:cursor-pointer">
//               <li
//                 className="my-[3px] flex cursor-pointer items-center px-8"
//                 key={index}
//               >
//                 <span
//                   className={`${
//                     activeRoute(route.path) === true
//                       ? "font-bold text-brand-500 dark:text-white"
//                       : "font-medium text-gray-600"
//                   }`}
//                 >
//                   {route.icon ? route.icon : <DashIcon />}{" "}
//                 </span>
//                 <p
//                   className={`leading-1 ml-4 flex ${
//                     activeRoute(route.path) === true
//                       ? "font-bold text-black-700 dark:text-white"
//                       : "font-medium text-gray-600"
//                   }`}
//                 >
//                   {route.name}
//                 </p>
//               </li>
//               {activeRoute(route.path) ? (
//                 <div class="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
//               ) : null}
//             </div>
//           </Link>
//         );
//       }
//     });
//   };
//   // BRAND
//   return createLinks(routes);
// }

// export default SidebarLinks;


/* eslint-disable */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import DashIcon from "components/icons/DashIcon";

export function SidebarLinks(props) {
  // Get the current location
  const location = useLocation();
  const { routes, role } = props;

  // Helper to check if a route is active
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  // Filter routes based on the role
  const filterRoutesByRole = (routes, role) => {
    return routes.filter((route) => route.roles && route.roles.includes(role));
  };

  // Generate sidebar links
  const createLinks = (filteredRoutes) => {
    return filteredRoutes.map((route, index) => {
      if (route.layout === "/user" || route.layout === "/admin") {
        return (
          <Link key={index} to={`${route.layout}/${route.path}`}>
            <div className="relative mb-3 flex hover:cursor-pointer">
              <li className="my-[3px] flex cursor-pointer items-center px-8" key={index}>
                <span
                  className={`${
                    activeRoute(route.path)
                      ? "font-bold text-brand-500 dark:text-white"
                      : "font-medium text-gray-600"
                  }`}
                >
                  {route.icon ? route.icon : <DashIcon />}{" "}
                </span>
                <p
                  className={`leading-1 ml-4 flex ${
                    activeRoute(route.path)
                      ? "font-bold text-black-700 dark:text-white"
                      : "font-medium text-gray-600"
                  }`}
                >
                  {route.name}
                </p>
              </li>
              {activeRoute(route.path) && (
                <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
              )}
            </div>
          </Link>
        );
      }
      return null;
    });
  };

  // Filter routes and create links
  const filteredRoutes = filterRoutesByRole(routes, role);
  return <ul>{createLinks(filteredRoutes)}</ul>;
}

export default SidebarLinks;
