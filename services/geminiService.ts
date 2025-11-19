import { GoogleGenAI, Type } from "@google/genai";
import { LearningStyle, KnowledgeLevel, Lesson } from '../types';

// API Key provided by user. 
// Note: For production deployments, it is recommended to use environment variables.
const apiKey = "AIzaSyAhAK9JYoOB8aRazE6cPUPQxhgGUv2zsfY";

const ai = new GoogleGenAI({ apiKey });

const lessonSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'A catchy and descriptive title for the lesson.' },
    introduction: { type: Type.STRING, description: 'A brief, engaging introduction to the topic.' },
    sections: {
      type: Type.ARRAY,
      description: 'An array of lesson sections, each with a title and content. These sections must be structured progressively, starting with fundamental concepts and gradually moving to more complex topics.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'The title of the lesson section.' },
          content: { type: Type.STRING, description: 'The main content of the lesson section, formatted with paragraphs. Use markdown for formatting like **bold** or *italics*.' },
        },
        required: ['title', 'content'],
      },
    },
    quiz: {
      type: Type.ARRAY,
      description: 'An array of exactly 10 multiple-choice questions to test understanding. Each question must have 4 options.',
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: 'The quiz question.' },
          options: {
            type: Type.ARRAY,
            description: 'An array of 4 possible answers as strings.',
            items: { type: Type.STRING },
          },
          correctAnswerIndex: { type: Type.INTEGER, description: 'The 0-based index of the correct answer in the options array.' },
        },
        required: ['question', 'options', 'correctAnswerIndex'],
      },
    },
  },
  required: ['title', 'introduction', 'sections', 'quiz'],
};


export const generateLesson = async (
  topic: string,
  subTopic: string,
  learningStyle: LearningStyle,
  knowledgeLevel: KnowledgeLevel,
  isRetry: boolean = false
): Promise<Lesson> => {
  const model = 'gemini-2.5-flash';
  
  const systemInstruction = `You are an expert instructional designer. Your task is to create a personalized, engaging, and interactive educational lesson based on the user's topic, learning style, and knowledge level. The output must be a valid JSON object matching the provided schema.

The lesson sections must be structured progressively, starting with the most fundamental concepts and gradually building up to more complex topics, ensuring a smooth learning curve.

Tailor the content to the specified learning style:
- For 'Visual' learners, describe diagrams, charts, or visual analogies. Use vivid imagery in your language.
- For 'Auditory' learners, structure content as if it were a script for a podcast or lecture. Use questions and conversational language.
- For 'Kinesthetic' learners, suggest simple, hands-on activities, experiments, or real-world examples the user can engage with.
- For 'Reading/Writing' learners, provide well-structured text, definitions, and encourage note-taking or summarizing.`;

  let prompt = `Generate a lesson on the topic of "${topic}".`;
  if (subTopic) {
    prompt += ` Specifically, focus on the sub-topic: "${subTopic}".`;
  }
  
  if (isRetry) {
    prompt = `This is a retry attempt for the user. Generate a SIMPLER, more foundational version of the lesson on "${topic}" ${subTopic ? `with a focus on "${subTopic}"` : ''}. Break down the core concepts into very easy-to-understand parts. The goal is to help a struggling learner grasp the basics.`;
  }
  
  prompt += ` The target audience has a "${knowledgeLevel}" understanding of the subject. The lesson should be tailored for a "${learningStyle}" learning style. Ensure the content is clear, concise, and broken down into digestible sections. The quiz must contain exactly 10 questions, each with 4 options.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: lessonSchema,
        temperature: isRetry ? 0.6 : 0.7, // Slightly less creative for simpler lesson
      },
    });

    const jsonText = response.text.trim();
    const lessonData = JSON.parse(jsonText);
    
    // Basic validation
    if (!lessonData.title || !lessonData.sections || !lessonData.quiz || lessonData.quiz.length !== 10) {
        throw new Error("Invalid lesson structure received from API. Expected 10 quiz questions.");
    }

    return lessonData as Lesson;

  } catch (error) {
    console.error("Error generating lesson with Gemini:", error);
    throw new Error("Failed to parse or retrieve lesson from the AI service.");
  }
};

export const generateElaboration = async (
  mainTopic: string,
  sectionTitle: string,
  sectionContent: string,
  knowledgeLevel: KnowledgeLevel
): Promise<string> => {
  const model = 'gemini-2.5-flash';
  
  const systemInstruction = `You are a helpful teaching assistant. Your goal is to explain a concept in a very simple and relatable way.`;

  const prompt = `The main topic of the lesson is "${mainTopic}". The current section is "${sectionTitle}".
The content of the section is: "${sectionContent.substring(0, 500)}..."

Based on this, generate a simple, clear, and concise analogy or a real-world example to help a person with a "${knowledgeLevel}" level of understanding grasp the core idea. The explanation should be short (2-4 sentences). Do not repeat the section title. Start directly with the analogy/example.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating elaboration with Gemini:", error);
    throw new Error("Failed to generate elaboration from the AI service.");
  }
};