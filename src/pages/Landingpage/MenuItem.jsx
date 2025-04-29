import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MenuItem = ({ name, path, icon }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = location.pathname === path;

  return (
    <div
      onClick={() => navigate(path)}
      className={`flex items-center justify-start w-[300px] h-[55px] mb-4 cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
        isActive ? "bg-[#29282b] text-[#00DAC6] font-bold" : "text-white"
      }`}
    >
      <span className="flex items-center flex-row-reverse px-2 w-full">
        <div className="flex-grow text-left font-bold text-[18px] leading-[23px] whitespace-nowrap">
          {name}
        </div>

        {/* PNG Icon Support with text color */}
        {icon && (
          <img
            src={icon}
            alt={`${name} icon`}
            className="w-[24px] h-[24px] object-contain mr-3"
            style={{
              filter: isActive
                ? "invert(44%) sepia(97%) saturate(1671%) hue-rotate(160deg) brightness(92%) contrast(101%)"
                : "invert(100%)", // Makes the icon white when inactive
            }}
          />
        )}
      </span>
    </div>
  );
};

export default MenuItem;
