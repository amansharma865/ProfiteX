import React from 'react';

const CenteredContent = () => {
  return (
    <div className="flex flex-col items-center justify-end h-4/5 space-y-4 pt-40">
      <h1
        className="text-center text-5xl md:text-5xl lg:text-6xl font-semibold text-white max-w-7xl animate-fade-up "
        style={{
          backgroundImage: 'linear-gradient(to top, gray, white)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        The ultimate solution for managing
      </h1>
      <h1
        className="text-center text-5xl md:text-5xl lg:text-6xl font-bold text-white max-w-7xl animate-fade-up"
        style={{
          backgroundImage: 'linear-gradient(to top, gray, white)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Billing and inventory 10X faster.
      </h1>
      <div className="text-center text-white text-lg md:text-l max-w-3xl mx-auto pt-6 pb-6 animate-fade-up">
        Join 30,000+ users and streamline your billing, inventory, and invoicing 10X faster with our Smart Billing Management System. Enjoy seamless integration and ultimate efficiency.
      </div>
      <div className="animate-fade-up">
        <a
          href="#signIn"
          className="bg-green-800 text-white py-3 px-6 rounded-full text-sm md:text-base font-medium hover:bg-green-700 transition duration-300"
        >
          Get Started with Pro
        </a>
      </div>
    </div>
  );
};

export default CenteredContent;
