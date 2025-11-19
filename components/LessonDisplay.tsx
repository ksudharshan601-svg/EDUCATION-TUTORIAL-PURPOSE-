import React, { useState, useEffect } from 'react';
import { Lesson, QuizQuestion } from '../types';
import { CheckIcon, XIcon, SparklesIcon, ArrowPathIcon, ShieldExclamationIcon, LightbulbIcon, PlayIcon, SpeakerWaveIcon, PauseIcon } from './icons/Icons';

interface LessonDisplayProps {
  lesson: Lesson;
  onQuizSubmit: (score: number, totalQuestions: number) => void;
  onFinish: () => void;
  onNewLesson: () => void;
  onRetry: () => void;
  quizResult: 'passed' | 'failed' | null;
  onElaborate: (sectionIndex: number) => void;
  elaboratingSectionIndex: number | null;
}

const LessonDisplay: React.FC<LessonDisplayProps> = ({ 
  lesson, 
  onQuizSubmit, 
  onFinish, 
  onNewLesson, 
  onRetry, 
  quizResult,
  onElaborate,
  elaboratingSectionIndex
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  
  const [speakingState, setSpeakingState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  // Reset state when a new lesson is loaded
  useEffect(() => {
    setSelectedAnswers(Array(lesson.quiz.length).fill(null));
    setQuizSubmitted(false);
    setQuizStarted(false);
    setSpeakingState('stopped');
    setCurrentlySpeakingId(null);

    // Cleanup speech synthesis on component unmount or lesson change
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [lesson]);

  const handleSpeechControl = (text: string, id: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    // Case 1: Clicked on a DIFFERENT paragraph while something else is playing/paused
    if (currentlySpeakingId && currentlySpeakingId !== id) {
      synth.cancel();
    }
  
    // Case 2: Clicked on the currently playing paragraph -> Pause
    if (speakingState === 'playing' && currentlySpeakingId === id) {
      synth.pause();
      setSpeakingState('paused');
      return;
    }
  
    // Case 3: Clicked on the currently paused paragraph -> Resume
    if (speakingState === 'paused' && currentlySpeakingId === id) {
      synth.resume();
      setSpeakingState('playing');
      return;
    }

    // Case 4: Clicked on a new paragraph (or the same one after it stopped) -> Play
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setSpeakingState('stopped');
      setCurrentlySpeakingId(null);
    };
    utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setSpeakingState('stopped');
        setCurrentlySpeakingId(null);
    };

    synth.speak(utterance);
    setSpeakingState('playing');
    setCurrentlySpeakingId(id);
  };


  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    let correctAnswers = 0;
    lesson.quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    setQuizSubmitted(true);
    onQuizSubmit(correctAnswers, lesson.quiz.length);
  };

  const allQuestionsAnswered = selectedAnswers.every(answer => answer !== null);

  const getOptionClasses = (q: QuizQuestion, questionIndex: number, optionIndex: number) => {
    if (!quizSubmitted) {
      return selectedAnswers[questionIndex] === optionIndex
        ? 'ring-2 ring-indigo-500 bg-indigo-100 dark:bg-indigo-900/50'
        : 'hover:bg-slate-100 dark:hover:bg-slate-700';
    }
    
    const isCorrect = q.correctAnswerIndex === optionIndex;
    const isSelected = selectedAnswers[questionIndex] === optionIndex;

    if (isCorrect) return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 ring-2 ring-green-500';
    if (isSelected && !isCorrect) return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 ring-2 ring-red-500';
    
    return 'bg-slate-50 dark:bg-slate-700/50';
  };
  
  const score = selectedAnswers.reduce((acc, answer, index) => {
    return answer === lesson.quiz[index].correctAnswerIndex ? acc + 1 : acc;
  }, 0);


  return (
    <div className="mt-8 animate-fade-in" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
      `}</style>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{lesson.title}</h2>
        <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">{lesson.introduction}</p>

        {lesson.sections.map((section, index) => (
          <div key={index} className="mb-6 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-lg transition-all duration-300">
            <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">{section.title}</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none mb-4 space-y-4">
              {section.content.split('\n').filter(p => p.trim() !== '').map((paragraph, pIndex) => {
                const paragraphId = `section-${index}-p-${pIndex}`;
                const isSpeaking = currentlySpeakingId === paragraphId;

                return (
                    <div key={pIndex} className="flex items-start gap-3">
                        <button
                            onClick={() => handleSpeechControl(paragraph, paragraphId)}
                            className="flex-shrink-0 mt-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                            aria-label={`Read paragraph aloud`}
                        >
                            {isSpeaking && speakingState === 'playing' && <PauseIcon className="h-5 w-5" />}
                            {isSpeaking && speakingState === 'paused' && <PlayIcon className="h-5 w-5" />}
                            {!isSpeaking || speakingState === 'stopped' ? <SpeakerWaveIcon className="h-5 w-5" /> : null}
                        </button>
                        <p>{paragraph}</p>
                    </div>
                )
              })}
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => onElaborate(index)}
                disabled={!!section.elaboration || elaboratingSectionIndex !== null}
                className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {elaboratingSectionIndex === index ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Thinking...
                  </>
                ) : (
                  <>
                    <LightbulbIcon className="mr-2 h-4 w-4" />
                    {section.elaboration ? 'Analogy Generated' : 'Elaborate with an Analogy'}
                  </>
                )}
              </button>
            </div>

            {section.elaboration && (
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-400 rounded-r-lg animate-fade-in">
                <p className="text-slate-700 dark:text-slate-200">{section.elaboration}</p>
              </div>
            )}
          </div>
        ))}

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-100">Check Your Knowledge</h3>
          
          {!quizStarted && (
            <div className="text-center">
              <button
                onClick={() => setQuizStarted(true)}
                className="inline-flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105"
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                Start Quiz
              </button>
            </div>
          )}

          {quizStarted && (
            <div className="animate-fade-in">
              <div className="space-y-6">
                {lesson.quiz.map((q, questionIndex) => (
                  <div key={questionIndex} className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg">
                    <p className="font-semibold text-lg mb-4 text-slate-700 dark:text-slate-200">{questionIndex + 1}. {q.question}</p>
                    <div className="space-y-3">
                      {q.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                          disabled={quizSubmitted}
                          className={`w-full text-left p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-all duration-200 ${getOptionClasses(q, questionIndex, optionIndex)}`}
                        >
                          <span className="flex-grow">{option}</span>
                          {quizSubmitted && q.correctAnswerIndex === optionIndex && <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />}
                          {quizSubmitted && selectedAnswers[questionIndex] === optionIndex && q.correctAnswerIndex !== optionIndex && <XIcon className="h-5 w-5 text-red-600 dark:text-red-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {!quizSubmitted && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!allQuestionsAnswered}
                    className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                  >
                    Submit Answers
                  </button>
                </div>
              )}

              {quizResult === 'passed' && (
                <div className="mt-8 text-center p-6 bg-green-50 dark:bg-green-900/30 rounded-lg animate-fade-in">
                  <h4 className="text-2xl font-bold text-green-700 dark:text-green-300">Great Job! Quiz Passed!</h4>
                  <p className="text-lg mt-2 text-slate-600 dark:text-slate-300">
                    You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{lesson.quiz.length}</span>.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={onFinish}
                      className="w-full sm:w-auto flex items-center justify-center bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300"
                    >
                      <SparklesIcon className="mr-2 h-5 w-5"/>
                      Finish Lesson & Learn More
                    </button>
                    <button 
                      onClick={onNewLesson}
                      className="w-full sm:w-auto flex items-center justify-center bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500 focus:ring-opacity-50 transition-all duration-300"
                    >
                      <ArrowPathIcon className="mr-2 h-5 w-5"/>
                      Start a New Lesson
                    </button>
                  </div>
                </div>
              )}

              {quizResult === 'failed' && (
                <div className="mt-8 text-center p-6 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700 animate-fade-in">
                  <h4 className="text-2xl font-bold text-red-700 dark:text-red-300">Keep Trying!</h4>
                  <p className="text-lg mt-2 text-slate-600 dark:text-slate-300">
                    You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{lesson.quiz.length}</span>. You need at least 50% to pass.
                  </p>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">Let's try a simpler version of this lesson to build your confidence.</p>
                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={onRetry}
                      className="w-full sm:w-auto flex items-center justify-center bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-300"
                    >
                      <ShieldExclamationIcon className="mr-2 h-5 w-5"/>
                      Retry with an Easier Lesson
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDisplay;