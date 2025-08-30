import React from 'react'

const Navbar = () => (
    <header className="bg-gray-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                    <FileJson className="h-8 w-8 text-indigo-400" />
                    <h1 className="text-xl font-bold text-gray-200">DocuExtract AI</h1>
                </div>
            </div>
        </div>
    </header>
);

export default Navbar