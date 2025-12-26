import React from 'react';
// import frame1 from "../../../assets/frame1.png"

const CenteredImage = () => {

  return (
    <div
      // style={{ backgroundColor: "#050323" }}
      style={{ backgroundColor: "#051708" }}
      className="relative flex justify-center items-center h-auto pb-6"
    >
      {/* Main Image */}
      <img
        src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725321840/frame1_jdktum.png"
        alt="Centered"
        className="w-4/5 animate-fade-up"
      />

      {/* Additional Images Positioned on Top */}
      <img
        src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725321518/main-chart-pro.7e5b8efa6626092f4ab5_pymcms.png"
        alt="Top"
        className="absolute top-[15%] left-[24%] w-[30%] shadow-2xl animate-fade-up"
      />
      <img
        src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725321612/circlr_nfzzz3.png"
        alt="Top"
        className="absolute top-[15%] left-[1%] w-[18%] shadow-2xl transform rotate-12 rounded-xl animate-fade"
      />
      <img
        src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725321612/circlr_nfzzz3.png"
        alt="Top"
        className="absolute top-[75%] left-[1%] w-[15%] shadow-2xl transform -rotate-12 rounded-xl animate-fade"
      />
      <img
        src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725321705/light_gihmax.png"
        alt="Top"
        className="absolute top-[15%] left-[83%] w-[15%] shadow-2xl transform -rotate-12 rounded-xl animate-fade"
      />
      <img
        src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725321765/pp_ma5xxj.png"
        alt="Top"
        className="absolute top-[68%] left-[80%] w-[18%] shadow-2xl transform rotate-12 rounded-xl animate-fade"
      />
    </div>
  );
};

export default CenteredImage;