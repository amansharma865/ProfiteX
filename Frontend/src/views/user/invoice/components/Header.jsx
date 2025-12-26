import React from 'react'
import { useNavigate } from 'react-router-dom'

const Header = ({len}) => {
    const navigate = useNavigate();
  return (
    <div className='main-container w-full h-auto flex justify-between'>
        <div className="invoice flex flex-col">
            <p className='text-3xl font-bold'>Invoices</p>
            <p className='text-sm'>there are total {len} invoices</p>
        </div>
        <div className="options flex flex-wrap justify-between gap-4 items-center">
            <div className="filter">
                <button><p>Filter by status <span>^</span> </p></button>
                
            </div>
            <div className="newInvoice">
                <button className='w-auto h-auto bg-blueSecondary rounded-full p-2 text-white' onClick={()=> navigate('/user/invoice/create-invoice')}>New Invoice</button>
            </div>
        </div>
      
    </div>
  )
}

export default Header
