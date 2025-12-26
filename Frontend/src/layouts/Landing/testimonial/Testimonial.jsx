import React, { useState, useEffect, useRef } from 'react';
import HeaderTest from './components/HeaderTest';
import TestimonialCard from './components/TestimonialCard';

const Testimonial = () => {
  const [isVisible, setIsVisible] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.000000000000000000000000000000000001 } // Extremely small threshold
    );

    const currentRef = mainRef.current; // Store the ref value in a local variable

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div className="w-full h-auto mt-10 relative overflow-hidden bg-[#f4f7fe] rounded-t-[100px] rounded-b-[100px]">
      {/* Gradient Shapes */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 rounded-full opacity-50 blur-3xl z-0"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-blue-500 via-teal-400 to -green-300 rounded-full opacity-40 blur-3xl z-0" ref={mainRef}></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-blue-500 via-teal-400 to -green-300 rounded-full opacity-40 blur-3xl z-0"></div>
      <div className="absolute top-1/4 left-1/2 w-[250px] h-[250px] bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 rounded-full opacity-20 blur-2xl z-0"></div>

      {/* Main Content */}
      <div className="relative z-10">
        <HeaderTest />
        <main
          ref={mainRef}
          className={`mx-auto flex min-w-[300px] max-w-[1160px] flex-1 items-center py-16`}
        >
          <div className="w-full">
            <article className="grid grid-cols-1 gap-y-10 px-6 md:grid-cols-4 md:gap-x-8 md:gap-y-10">
              <TestimonialCard
                name="Daniel Clifford"
                className={`purple-card md:col-span-2 rounded-lg bg-gradient-to-r from-green-900 to-green-500 shadow-lg text-white ${isVisible ? 'animate-T-slide-right' : 'hidden'}`}
                avatarBorder="border-opacity-40 border-white border-4"
              />
              <TestimonialCard
                name="Jonathan Walters"
                className={`dark bg-tg-gray-blue rounded-lg bg-green-900 shadow-lg text-white ${isVisible ? 'animate-T-slide-up' : 'hidden'}`}
                avatarBorder="border-opacity-70 border-white border-4"
              />
              <TestimonialCard
                name="Jeanette Harmon"
                className={`light rounded-lg bg-white shadow-lg text-gray-900 ${isVisible ? 'animate-T-slide-left' : 'hidden'}`}
                avatarBorder="border-white border-4"
              />
              <TestimonialCard
                name="Patrick Abrams"
                className={`dark bg-tg-dark-blue md:col-span-2 rounded-lg bg-gradient-to-r from-green-900 to-green-900 shadow-lg text-white ${isVisible ? 'animate-T-slide-down' : 'hidden'}`}
                avatarBorder="border-indigo-500 border-4"
              />
              <TestimonialCard
                name="Kira Whittle"
                className={`light md:col-start-4 md:row-span-2 md:row-start-1 rounded-lg bg-white shadow-lg text-gray-900 ${isVisible ? 'animate-T-slide-left' : 'hidden'}`}
                avatarBorder="border-indigo-400 border-4"
              />
            </article>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Testimonial;
