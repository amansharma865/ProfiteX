import React, { useState, useEffect, useRef } from 'react';
import GSTIN from './GSTIN';
import CODES from './HSN-SAC CODES';
import INVOICES from './INVOICES';
import TAXES from './TAXES';
import BILLS from './E-WAY BILLS';
import DELIVERYCHALLAN from './DELIVERY CHALLAN';
import Navbar from './navbar';

const LandingFeatures = () => {
  const [activeContent, setActiveContent] = useState(0);
  const [isGSTINVisible, setIsGSTINVisible] = useState(false);
  const gstinRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsGSTINVisible(true);
          } else {
            setIsGSTINVisible(false); // Optionally reset animation if div is not visible
          }
        });
      },
      {
        threshold: 0.3, // Adjust the threshold to trigger the animation when 30% of the div is visible
      }
    );

    const currentRef = gstinRef.current; // Store the current value of gstinRef

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleButtonClick = (index) => {
    setActiveContent(index);
    if (index === 0) {
      setIsGSTINVisible(true);
    }
  };

  const renderContent = () => {
    switch (activeContent) {
      case 0:
        return (
          <div ref={gstinRef}>
            <GSTIN triggerAnimation={isGSTINVisible} />
          </div>
        );
      case 1:
        return <CODES />;
      case 2:
        return <INVOICES />;
      case 3:
        return <TAXES />;
      case 4:
        return <BILLS />;
      case 5:
        return <DELIVERYCHALLAN />;
      default:
        return <GSTIN />;
    }
  };

  return (
    <>
      <Navbar setActiveContent={handleButtonClick} />
      <div className="content-container">{renderContent()}</div>
    </>
  );
};

export default LandingFeatures;
