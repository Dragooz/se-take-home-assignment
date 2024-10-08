import React from "react";

const Design = () => {
    return (
        <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-8 rounded-lg shadow-xl">
            <h1 className="text-4xl font-bold text-white mb-4">Design</h1>
            <p className="text-gray-200 hover:text-yellow-300 transition-colors duration-300">
                Welcome to the design page!
            </p>
            <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transform hover:scale-105 transition-transform duration-200">
                Explore
            </button>
        </div>
    );
};

export default Design;
