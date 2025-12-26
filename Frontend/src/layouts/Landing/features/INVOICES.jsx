import React from 'react';
// import invoiceimg from '../../../assets/invoiceimg.png';
// import checkmark from '../../../assets/checkmark.png';

const INVOICES = () => {
  return (
    <div className="container mx-auto p-4 flex justify-center animate-fade">
      <div className="inline-block w-[39%] align-top">
        <img className='h-[100%] w-[100%] transform translate-x-[50px] animate-slide-right' src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725361920/invoiceimg_pac96g.png" alt="feature1" />
      </div>
      <div className="inline-block w-[39%] align-top">
        <div className="block m-[12%] mx-[14%] w-[71%] animate-slide-left">
          <h1 className='font-semibold text-2xl mb-2'>Invoice Generator</h1>
          <p className='leading-[26px] text-gray-800 font-normal'>
            Keep a central record of the GSTIN for the registered businesses and save time from manually entering it every time.
          </p>
          <ul className='mt-[4%] list-disc list-inside'>
            <li className="flex items-center mt-2">
              <img className='w-[24px] h-[24px] text-green-500' src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725361462/checkmark_emsav6.png" alt="" />
              <span className="ml-2">Save GSTIN of customers and vendors</span>
            </li>

            <li className="flex items-center mt-2">
              <img className='w-[24px] h-[24px] text-green-500' src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725361462/checkmark_emsav6.png" alt="" />
              <span className="ml-2">GSTIN gets added in the documents automatically</span>
            </li>

            <li className="flex items-center mt-2">
              <img className='w-[24px] h-[24px]' src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725361462/checkmark_emsav6.png" alt="" />
              <span className="ml-2">Documents like invoice, bills, sales and purchase orders</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default INVOICES;