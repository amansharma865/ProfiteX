import React from 'react';

const HeaderTest = () => {
  return (
    <div className="main w-full flex flex-col justify-center items-center mt-10 py-10  rounded-lg ">
      <p className='text-2xl text-blue-900 text-center font-semibold uppercase tracking-widest mb-2'>
        What People Say
      </p>
      <p className='text-6xl text-center font-bold text-gray-800 leading-tight'>
        Trusted By 3000
      </p>
      <p className='text-6xl text-center font-bold text-gray-800 leading-tight mb-4'>
        Businesses Worldwide
      </p>
      <p className='text-lg text-center text-gray-800 max-w-3xl leading-relaxed mb-2 '>
        Thousands of lovers, businesses, startups, and many companies from all around the world use and trust Profitex.
      </p>
      <p className='text-lg text-center text-gray-800 max-w-3xl leading-relaxed '>
        If you don't believe our words, you may trust their testimonials!
      </p>
    </div>
  );
}

export default HeaderTest;
