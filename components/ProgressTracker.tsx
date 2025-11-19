
import React from 'react';
import { TrophyIcon } from './icons/Icons';

interface ProgressTrackerProps {
  completedLessons: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completedLessons }) => {
  return (
    <div className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center sm:justify-start space-x-4">
      <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
        <TrophyIcon className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
      </div>
      <div>
        <h3 className="font-bold text-xl text-slate-800 dark:text-white">Your Progress</h3>
        <p className="text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-indigo-500">{completedLessons}</span> {completedLessons === 1 ? 'lesson' : 'lessons'} completed!
        </p>
      </div>
    </div>
  );
};

export default ProgressTracker;
