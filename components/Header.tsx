
import React from 'react';
import { BrainCircuitIcon } from './icons/Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 py-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BrainCircuitIcon className="h-8 w-8 text-indigo-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            You<span className="text-indigo-500">Learn</span>
          </h1>
        </div>
        <p className="hidden md:block text-slate-500 dark:text-slate-400">Your Personal AI Learning Assistant</p>
      </div>
    </header>
  );
};

export default Header;
