import React, { useEffect, useState, useRef } from "react";

const GSTIN = ({ triggerAnimation }) => {
  const [animate, setAnimate] = useState(false);
  const divRef = useRef(null);

  const handleVisibility = (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000); // Reset animation
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleVisibility, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    });

    const currentDiv = divRef.current; // Save the current value of divRef

    if (currentDiv) {
      observer.observe(currentDiv);
    }

    return () => {
      if (currentDiv) {
        observer.unobserve(currentDiv);
      }
    };
  }, []);

  useEffect(() => {
    if (triggerAnimation) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    }
  }, [triggerAnimation]);

  return (
    <div
      ref={divRef}
      className={`container mx-auto p-4 flex justify-center ${
        animate ? "animate-fade" : ""
      }`}
    >
      <div className="inline-block w-[39%] align-top">
        <img
          className={`h-[100%] w-[100%] transform translate-x-[50px] ${
            animate ? "animate-slide-right" : ""
          }`}
          src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725361581/deliveryimg_p9uhnf.png"
          alt="feature1"
        />
      </div>
      <div className="inline-block w-[39%] align-top">
        <div
          className={`block m-[12%] mx-[14%] w-[71%] ${
            animate ? "animate-slide-left" : ""
          }`}
        >
          <h1 className="font-semibold text-2xl mb-2">Save GSTINs</h1>
          <p className="leading-[26px] text-gray-800 font-normal">
            Keep a central record of the GSTIN for the registered businesses and save time from manually entering it every time.
          </p>
          <ul className="mt-[4%] list-disc list-inside">
            <li className="flex items-center mt-2">
              <img
                className="w-[24px] h-[24px] text-green-500"
                src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725361462/checkmark_emsav6.png"
                alt=""
              />
              <span className="ml-2">Save GSTIN of customers and vendors</span>
            </li>
            <li className="flex items-center mt-2">
              <img
                className="w-[24px] h-[24px] text-green-500"
                src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725361462/checkmark_emsav6.png"
                alt=""
              />
              <span className="ml-2">
                GSTIN gets added in the documents automatically
              </span>
            </li>
            <li className="flex items-center mt-2">
              <img
                className="w-[24px] h-[24px]"
                src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725361462/checkmark_emsav6.png"
                alt=""
              />
              <span className="ml-2">
                Documents like invoice, bills, sales and purchase orders
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GSTIN;
