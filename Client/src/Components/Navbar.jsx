import React from 'react'
import { FileJson} from 'lucide-react';

const Navbar = () => (
    <header className="bg-gray-900 backdrop-blur-md sticky top-0 z-10 border-b border-gray-700">
        <div className="max-w-5xl  px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                    <FileJson className="h-8 w-8 text-indigo-400" />
                    <h1 className="text-xl font-semibold text-gray-200">OCR System</h1>
                </div>
            </div>
        </div>
    </header>
);

export default Navbar