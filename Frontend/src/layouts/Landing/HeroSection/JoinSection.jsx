import React from 'react';
// import microsoftimg from "../../../assets/Microsoft.png";
// import unityimg from "../../../assets/unity.png";
// import ximg from "../../../assets/twitter.png";

const Join = () => {

  return (
    // <div style={{ backgroundColor: "#050323" }} 
    <div style={{ backgroundColor: "#051708" }} 
    className="text-center pt-20 pb-14 rounded-b-[75px]">
      <h2 className="text-2xl md:text-3xl text-white font-semibold mb-10">
          JOIN 30,000+ USERS STREAMLINING BILLING, INVENTORY, AND INVOICING
      </h2>

      {/* Icons */}
      <div className="flex justify-center space-x-14 mb-8">
        <img src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725321304/Microsoft_i6bjkb.png" alt="Icon 1" className="h-12 w-12 invert" />
        {/* <img src={appleimg} alt="Icon 2" className="h-12 w-12 invert" /> */}
        <img src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725321371/unity_xtpcuy.png" alt="Icon 3" className="h-12 w-12 invert" />
        <img src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725321419/twitter_hg4vmm.png" alt="Icon 4" className="h-12 w-12 invert" />
      </div>

      {/* Overlapping Profile Images and Review */}
      <div className="flex justify-center items-center space-x-4">
        <div className="flex -space-x-4">
          <img
            src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725360629/redgirl_qr7ty5.avif"
            alt="Profile 1"
            className="h-12 w-12 rounded-full border-2 border-white"
          />
          <img
            src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725360908/1_agmbvj.avif"
            alt="Profile 2"
            className="h-12 w-12 rounded-full border-2 border-white"
          />
          <img
            src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725361014/2_qtmw4o.avif"
            alt="Profile 3"
            className="h-12 w-12 rounded-full border-2 border-white"
          />
          <img
            src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725361079/3_swxbag.avif"
            alt="Profile 4"
            className="h-12 w-12 rounded-full border-2 border-white"
          />
        </div>

        {/* Review Text */}
        <div className="text-white text-lg md:text-xl">
          " ProfitX has transformed the way we build applications. Highly recommend! "
        </div>
      </div>
    </div>
  );
};

export default Join;