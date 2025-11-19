import React, { useState } from 'react';
import { LearningStyle, KnowledgeLevel } from '../types';
import { BookIcon, EarIcon, LightbulbIcon, PencilIcon, BrainCircuitIcon, ChevronRightIcon } from './icons/Icons';

interface LessonGeneratorFormProps {
  onGenerate: (topic: string, subTopic: string, learningStyle: LearningStyle, knowledgeLevel: KnowledgeLevel) => void;
  isGenerating: boolean;
}

const learningStyleOptions = [
  { value: LearningStyle.VISUAL, label: 'Visual', icon: <LightbulbIcon className="h-6 w-6" /> },
  { value: LearningStyle.AUDITORY, label: 'Auditory', icon: <EarIcon className="h-6 w-6" /> },
  { value: LearningStyle.KINESTHETIC, label: 'Kinesthetic', icon: <PencilIcon className="h-6 w-6" /> },
  { value: LearningStyle.READING_WRITING, label: 'Reading/Writing', icon: <BookIcon className="h-6 w-6" /> },
];

const knowledgeLevelOptions = [
  { value: KnowledgeLevel.BEGINNER, label: 'Beginner' },
  { value: KnowledgeLevel.INTERMEDIATE, label: 'Intermediate' },
  { value: KnowledgeLevel.ADVANCED, label: 'Advanced' },
];

const LessonGeneratorForm: React.FC<LessonGeneratorFormProps> = ({ onGenerate, isGenerating }) => {
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(LearningStyle.VISUAL);
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel>(KnowledgeLevel.BEGINNER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isGenerating) {
      onGenerate(topic, subTopic, learningStyle, knowledgeLevel);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 transition-all">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Create Your Lesson</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Tell us what you want to learn, and we'll tailor a lesson just for you.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">Learning Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'The basics of Quantum Physics'"
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            required
          />
        </div>

        <div>
          <label htmlFor="sub-topic" className="block text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">Sub-Topic <span className="text-sm font-normal text-slate-500">(Optional)</span></label>
          <input
            id="sub-topic"
            type="text"
            value={subTopic}
            onChange={(e) => setSubTopic(e.target.value)}
            placeholder="e.g., 'Schrödinger's Cat'"
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">Choose Your Learning Style</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {learningStyleOptions.map(option => (
              <button
                type="button"
                key={option.value}
                onClick={() => setLearningStyle(option.value)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                  learningStyle === option.value
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 text-indigo-600 dark:text-indigo-300 ring-2 ring-indigo-500'
                    : 'bg-slate-100 dark:bg-slate-700 border-transparent hover:border-indigo-400 text-slate-600 dark:text-slate-300'
                }`}
              >
                {option.icon}
                <span className="mt-2 font-medium text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">Select Your Knowledge Level</h3>
          <div className="flex flex-col sm:flex-row bg-slate-100 dark:bg-slate-700 rounded-lg p-1 space-y-1 sm:space-y-0 sm:space-x-1">
            {knowledgeLevelOptions.map(option => (
              <button
                type="button"
                key={option.value}
                onClick={() => setKnowledgeLevel(option.value)}
                className={`w-full text-center px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  knowledgeLevel === option.value
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <span>Generate My Lesson</span>
                <ChevronRightIcon className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonGeneratorForm;