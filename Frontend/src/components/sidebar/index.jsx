import whitelogo from '../../assets/whitelogo.png'
import { HiX } from "react-icons/hi";
import Links from "./components/Links";
import { Link } from 'react-router-dom'

import routes from "routes.js";

const Sidebar = ({ open, onClose, role}) => {
  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-white/5 transition-all dark:!bg-black-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
    >
      <span
        className="absolute top-4 right-4 block cursor-pointer xl:hidden"
        onClick={onClose}
      >
        <HiX />
      </span>

      <div className={`mx-[50px] mt-[40px] flex items-center`}>
        <Link to={'/'}>
        <div className="h-1 mb-3 font-poppins text-[26px] font-bold uppercase text-black-700 dark:text-white">
          <img src={whitelogo} alt="" className='w-44 h-10 invert-0 bg-blueSecondary p-2 rounded-md'/>
        </div>
        </Link>
      </div>
      <div className="mt-[58px] mb-7 h-px bg-gray-300 dark:bg-white" />
      {/* Nav item */}

      <ul className="mb-auto pt-1">
        <Links routes={routes} role={role} />
      </ul>

      

      {/* Nav item end */}
    </div>
  );
};

export default Sidebar;
