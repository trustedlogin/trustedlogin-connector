// Spinner.js
import React from "react";
import PropTypes from "prop-types";

const Spinner = ({ size }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
    {size && (
      <style>
        {`
          body .spinner-dark-tl:before,
          body .spinner-light-tl:before {
            width: ${size}px;
            height: ${size}px;
          }
        `}
      </style>
    )}
    <div className="spinner-dark-tl"></div>
  </div>
);

Spinner.propTypes = {
  size: PropTypes.number,
};

export default Spinner;
