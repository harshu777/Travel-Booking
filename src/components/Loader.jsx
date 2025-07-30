import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
      <div className="loader">
        <span><span></span><span></span><span></span><span></span></span>
        <div className="base">
          <span></span>
          <div className="face"></div>
        </div>
      </div>
      <div className="longfazers">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <h1 className="text-lg font-bold absolute top-[60%]">Loading...</h1>
    </div>
  );
};

export default Loader;