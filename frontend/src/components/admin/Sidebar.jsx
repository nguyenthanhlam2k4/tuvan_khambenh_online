import React from "react";
import { FaUser } from "react-icons/fa6";

const menuItems = [
  { icon: FaUser, label: "Users" },
  { icon: FaUser, label: "Bác sĩ" },
  { icon: FaUser, label: "Bệnh nhân" },
];

const Sidebar = ({ active, setActive }) => {
  return (
    <div className="flex flex-col h-screen w-60 bg-xamden px-4 py-6">
      {/* Header */}
      <div className="w-full text-center mb-4">
        <span className="font-bold tracking-widest text-sm uppercase">
          Admin Dashboard
        </span>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4" />

      {/* Menu */}
      <div className="flex flex-col gap-1">
        {menuItems.map(({ icon: Icon, label }) => {
          const isActive = active === label;

          return (
            <div
              key={label}
              onClick={() => setActive(label)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all duration-200
                ${isActive
                  ? "bg-white shadow-md"
                  : "hover:bg-white/80"}`}
            >
              {/* Icon */}
              <div
                className={`p-2 rounded-xl transition-all duration-200
                  ${isActive
                    ? "bg-xanhluc text-white shadow-sm"
                    : "bg-white shadow-sm text-xanhluc"}`}
              >
                <Icon className="text-sm" />
              </div>

              {/* Text */}
              <p
                className={`text-xs font-semibold tracking-wide transition-all duration-200
                  ${isActive ? "text-gray-800" : "text-gray-400"}`}
              >
                {label}
              </p>

              {/* Active indicator */}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-xanhluc" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;