import React from "react";

const UnitToggle = ({ isCelsius, toggleTempUnit }) => {
  return (
    <button className="temp-toggle" onClick={toggleTempUnit}>
      {isCelsius ? "Switch to °F" : "Switch to °C"}
    </button>
  );
};

export default UnitToggle;
