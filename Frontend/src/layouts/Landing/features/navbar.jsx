import React, { useState } from 'react';

const Navbar = ({ setActiveContent }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = ["GSTIN", "INVENTORY", "INVOICES", "VIDEO CONFERENCING", "STATUS", " SERVICES"];
  
  return (
    <>
      <h1 className="mt-28 mb-16 text-[#050323] flex justify-center font-semibold text-5xl">
        What makes ProfitX GST Compliant
      </h1>

      <div className="flex justify-center ">
        <div className="flex justify-center font-semibold flex-col items-center md:flex-row shadow-[0 1px 10px #e0dddb] border border-gray-200 rounded-md shadow-custom">
          {tabs.map((text, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  setActiveContent(index);
                }}
                className={`relative group inline-block text-black border border-r-[1px] border-r-solid border-r-[#f0f0f0] cursor-pointer ${isActive ? 'text-green-700' : ''}`}
              >
                <span className="relative z-10 px-8 py-7 block">
                  {text}
                </span>
                <div className={`absolute inset-x-0 bottom-0 h-1 bg-green-700 transform ${isActive ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100 transition-transform duration-500`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;