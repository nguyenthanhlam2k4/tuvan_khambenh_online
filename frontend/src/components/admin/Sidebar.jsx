import React from "react";
import { FaUserDoctor } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";
import { FaUser } from "react-icons/fa";

const menuItems = [
  { icon: <FaUser />, lable: "Users" },
  { icon: <FaUser />, lable: "Bác sĩ" },
  { icon: <FaUser />, lable: "Bệnh nhân" },
];

const Sidebar = ({active, setActive}) => {
  return (
    <div>
      <div className="flex items-center gap-2 text-3xl font-bold mb-8">
        <FaUserDoctor />
        <span>Doctor</span>
      </div>
      <div className="">
        {menuItems.map((item) => (
          <div 
          key={item.lable}
          onClick={() => setActive(item.lable)}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors duration-200
          ${active === item.lable
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
          }`}
          > 
          <span className="text-lg">{item.icon}</span>
          <p className="text-sm font-medium">{item.lable}</p>
          </div>
        ))

        }
      </div>
    </div>
  );
};

export default Sidebar;
