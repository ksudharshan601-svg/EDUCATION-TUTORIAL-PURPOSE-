import React, { useState, useCallback } from 'react';
import { Lesson, LearningStyle, KnowledgeLevel } from './types';
import { generateLesson, generateElaboration } from './services/geminiService';
import Header from './components/Header';
import LessonGeneratorForm from './components/LessonGeneratorForm';
import LessonDisplay from './components/LessonDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ProgressTracker from './components/ProgressTracker';

interface LessonRequest {
  topic: string;
  subTopic: string;
  learningStyle: LearningStyle;
  knowledgeLevel: KnowledgeLevel;
}

const App: React.FC = () => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number>(0);
  const [showForm, setShowForm] = useState<boolean>(true);
  const [currentLessonRequest, setCurrentLessonRequest] = useState<LessonRequest | null>(null);
  const [quizResult, setQuizResult] = useState<'passed' | 'failed' | null>(null);
  const [elaboratingSectionIndex, setElaboratingSectionIndex] = useState<number | null>(null);

  const handleGenerateLesson = useCallback(async (
    topic: string, 
    subTopic: string, 
    learningStyle: LearningStyle, 
    knowledgeLevel: KnowledgeLevel, 
    isRetry: boolean = false
  ) => {
    setIsLoading(true);
    setError(null);
    setLesson(null);
    setShowForm(false);
    setQuizResult(null);

    if (!isRetry) {
        setCurrentLessonRequest({ topic, subTopic, learningStyle, knowledgeLevel });
    }
    
    try {
      const generatedLesson = await generateLesson(topic, subTopic, learningStyle, knowledgeLevel, isRetry);
      setLesson(generatedLesson);
    } catch (e) {
      setError('Failed to generate lesson. Please try again.');
      console.error(e);
      setShowForm(true); // Show form again on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleElaborate = async (sectionIndex: number) => {
    if (!lesson || !currentLessonRequest) return;

    setElaboratingSectionIndex(sectionIndex);
    try {
      const section = lesson.sections[sectionIndex];
      const elaboration = await generateElaboration(
        currentLessonRequest.topic,
        section.title,
        section.content,
        currentLessonRequest.knowledgeLevel
      );

      const updatedSections = [...lesson.sections];
      updatedSections[sectionIndex] = { ...section, elaboration };
      setLesson({ ...lesson, sections: updatedSections });

    } catch (e) {
      console.error("Failed to generate elaboration:", e);
      // Optionally, set an error state for the specific section
    } finally {
      setElaboratingSectionIndex(null);
    }
  };
  
  const handleQuizSubmit = (score: number, totalQuestions: number) => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 50) {
      setQuizResult('passed');
    } else {
      setQuizResult('failed');
    }
  };

  const handleFinishLesson = () => {
    setCompletedLessons(prev => prev + 1);
    setLesson(null);
    setShowForm(true);
    setCurrentLessonRequest(null);
    setQuizResult(null);
  };
  
  const handleNewLesson = () => {
    setLesson(null);
    setShowForm(true);
    setCurrentLessonRequest(null);
    setQuizResult(null);
  }

  const handleRetryLesson = () => {
    if (currentLessonRequest) {
      const { topic, subTopic, learningStyle, knowledgeLevel } = currentLessonRequest;
      handleGenerateLesson(topic, subTopic, learningStyle, knowledgeLevel, true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <ProgressTracker completedLessons={completedLessons} />
        
        {showForm && (
          <LessonGeneratorForm 
            onGenerate={(topic, subTopic, style, level) => handleGenerateLesson(topic, subTopic, style, level)} 
            isGenerating={isLoading} 
          />
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg mt-8">
            <LoadingSpinner />
            <p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-300">Crafting your personalized lesson...</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">This might take a moment.</p>
          </div>
        )}

        {error && (
          <div className="mt-8 text-center p-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
            <h3 className="font-bold">An Error Occurred</h3>
            <p>{error}</p>
          </div>
        )}

        {lesson && !isLoading && (
          <LessonDisplay 
            lesson={lesson} 
            onQuizSubmit={handleQuizSubmit}
            onFinish={handleFinishLesson}
            onNewLesson={handleNewLesson}
            onRetry={handleRetryLesson}
            quizResult={quizResult}
            onElaborate={handleElaborate}
            elaboratingSectionIndex={elaboratingSectionIndex}
          />
        )}
      </main>
    </div>
  );
};

export default App;