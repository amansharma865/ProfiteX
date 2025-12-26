import React from 'react';
import Paid from './options/Paid';
import Pending from './options/Pending';
import Decline from './options/Decline';

const Row = ({ invoiceId, date, nameOfCustomer, amount, status }) => {
  return (
    <div className='w-full h-auto rounded-md flex flex-row m-auto justify-between items-center p-3 shadow-md hover:bg-[#f5f8fe] dark:bg-[#1b254b] dark:border-gray-700 dark:hover:border-blue-500'>
      <div className="id">
        <p className='font-semibold text-gray-800 dark:text-gray-200'>{invoiceId}</p>
      </div>  
      <div className="date w-28">
        <p className='text-gray-600 font-bold dark:text-gray-400 text-center'>{date}</p>
      </div>  
      <div className="name  w-44  ">
        <p className='font-semibold text-gray-600 dark:text-gray-300 text-center'>{nameOfCustomer}</p>
      </div>  
      <div className="amount  w-28">
        <p className='font-bold text-black dark:text-white text-center'>{amount}</p>
      </div>  
      <div className='status'>
        {status === 'paid' ? <Paid /> : status === 'pending' ? <Pending /> : <Decline />}
      </div>
    </div>
  );
};

export default Row;
