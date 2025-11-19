export enum LearningStyle {
  VISUAL = 'Visual',
  AUDITORY = 'Auditory',
  KINESTHETIC = 'Kinesthetic',
  READING_WRITING = 'Reading/Writing',
}

export enum KnowledgeLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface LessonSection {
  title: string;
  content: string;
  elaboration?: string; // To store the generated analogy/example
}

export interface Lesson {
  title: string;
  introduction: string;
  sections: LessonSection[];
  quiz: QuizQuestion[];
}