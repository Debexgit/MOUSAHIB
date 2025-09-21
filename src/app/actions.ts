'use server';

import {generateActivityIdeas} from '@/ai/flows/generate-activity-ideas';
import {generateLessonPlan} from '@/ai/flows/generate-lesson-plan';
import {generateTts} from '@/ai/flows/generate-tts';
import {summarizeDayForParents} from '@/ai/flows/summarize-day-for-parents';

type BilingualResult = {
  arabic: string | null;
  french: string | null;
  arabicAudio?: string | null;
  frenchAudio?: string | null;
  error: string | null;
};

// Generic error handler
function handleError(e: unknown): BilingualResult {
  console.error(e);
  const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
  return {
    arabic: null,
    french: null,
    error: `عذرًا، حدث خطأ أثناء إنشاء المحتوى. ${errorMessage}`,
  };
}

async function generateBilingualContent(prompt: string): Promise<BilingualResult> {
  try {
    const result = await generateLessonPlan({prompt});
    return {
      arabic: result.lessonPlanArabic,
      french: result.lessonPlanFrench,
      error: null,
    };
  } catch (e) {
    return handleError(e);
  }
}

// =================================================================
// DEDICATED HANDLERS FOR EACH TOOL
// =================================================================

// --- التخطيط (Planning) ---
export async function handleLesson(userInput: string, age: string) {
  const ageContext =
    age === '4 years' ? 'التمهيدي الأول (Moyenne Section)' : 'التمهيدي الثاني (Grande Section)';
  const prompt = `You are an expert teacher. Your task is to prepare a detailed lesson plan for children in the '${ageContext}' level. The topic is: "${userInput}".

Provide the response in both Arabic and French.
Provide ONLY the plan, without any introduction or conclusion.`;
  return generateBilingualContent(prompt);
}

// --- أنشطة الفصل (Classroom Activities) ---
export async function handleActivity(userInput: string, age: string): Promise<BilingualResult> {
  try {
    const ageContext =
      age === '4 years' ? 'التمهيدي الأول (Moyenne Section)' : 'التمهيدي الثاني (Grande Section)';
    const result = await generateActivityIdeas({
      topic: `For children in the '${ageContext}' level: ${userInput}`,
    });
    return {
      arabic: result.activityIdeasArabic,
      french: result.activityIdeasFrench,
      error: null,
    };
  } catch (e) {
    return handleError(e);
  }
}

// --- بطاقات تعليمية (Flashcards) ---
export async function handleFlashcard(userInput: string, age: string) {
  const ageContext =
    age === '4 years' ? 'التمهيدي الأول (Moyenne Section)' : 'التمهيدي الثاني (Grande Section)';
  const prompt = `You are an educational material designer. Your task is to create a list of 3-4 key words and simple concepts for making flashcards for children in the '${ageContext}' level about the topic: "${userInput}".

Provide the response in both Arabic and French.
Provide ONLY the list, without any introduction or conclusion.`;
  return generateBilingualContent(prompt);
}

// --- موارد تعليمية (Educational Resources) ---
export async function handleStory(userInput: string, age: string) {
  const ageContext =
    age === '4 years'
      ? 'التمهيدي الأول (Moyenne Section), aged 3-4 years'
      : 'التمهيدي الثاني (Grande Section), aged 5-6 years';
  const prompt = `You are a talented children's story writer. Your task is to write a short, simple, and engaging story for children in the '${ageContext}' level. The story should be very simple, with a clear moral, and suitable for the specified age. The story's theme is: "${userInput}".

Provide the response in both Arabic and French.
Provide ONLY the story, without any introduction or conclusion.`;
  return generateBilingualContent(prompt);
}
export async function handleSong(userInput: string, age: string): Promise<BilingualResult> {
  const ageContext =
    age === '4 years' ? 'التمهيدي الأول (Moyenne Section)' : 'التمهيدي الثاني (Grande Section)';
  const prompt = `Your role is a composer and lyricist specializing in children's songs for kids in the '${ageContext}' level. Your task is to compose a simple and fun educational song with easy-to-remember lyrics. The song's topic is: "${userInput}".

Provide the response in both Arabic and French.
Provide ONLY the song lyrics, without any introduction or conclusion.`;
  const lyricsResult = await generateBilingualContent(prompt);
  if (lyricsResult.error) {
    return lyricsResult;
  }
  try {
    const [arabicAudio, frenchAudio] = await Promise.all([
      generateTts({text: lyricsResult.arabic!, speaker: 'Algenib'}),
      generateTts({text: lyricsResult.french!, speaker: 'Odeya'}),
    ]);

    return {
      arabic: lyricsResult.arabic,
      french: lyricsResult.french,
      arabicAudio: arabicAudio.media,
      frenchAudio: frenchAudio.media,
      error: null,
    };
  } catch (e) {
    console.error(e);
    return {
      arabic: lyricsResult.arabic,
      french: lyricsResult.french,
      error: 'تم إنشاء كلمات الأغنية بنجاح، ولكن حدث خطأ أثناء توليد الصوت.',
    };
  }
}

// --- ملخص اليوم والملاحظات (Day Summary & Notes) ---
export async function handleSummary(userInput: string, age: string): Promise<BilingualResult> {
  try {
    const ageContext =
      age === '4 years' ? 'التمهيدي الأول (Moyenne Section)' : 'التمهيدي الثاني (Grande Section)';
    const result = await summarizeDayForParents({
      activities: `For children in level '${ageContext}', the activities were: ${userInput}`,
    });
    return {arabic: result.summaryArabic, french: result.summaryFrench, error: null};
  } catch (e) {
    return handleError(e);
  }
}

// --- رسائل للأهل (Messages for Parents) ---
export async function handleCommunication(userInput: string, age: string) {
  const ageContext =
    age === '4 years' ? 'التمهيدي الأول (Moyenne Section)' : 'التمهيدي الثاني (Grande Section)';
  const prompt = `You are a specialist in parent communication for a preschool/kindergarten (children in level '${ageContext}'). Your task is to write a draft of a positive, brief, and professional message to a parent about: "${userInput}".

Provide the response in both Arabic and French.
Provide ONLY the message, without any introduction or conclusion.`;
  return generateBilingualContent(prompt);
}

// --- أنشطة منزلية (Home Activities) ---
export async function handleParent(userInput: string, age: string) {
  const ageContext =
    age === '4 years' ? 'التمهيدي الأول (Moyenne Section)' : 'التمهيدي الثاني (Grande Section)';
  const prompt = `You are an expert in family-school partnership. Your task is to suggest 2-3 simple and fun home activities that parents can do with their children (level '${ageContext}') to reinforce learning about the topic: "${userInput}".

Provide the response in both Arabic and French.
Provide ONLY the activities, without any introduction or conclusion.`;
  return generateBilingualContent(prompt);
}

// --- خطة دعم (Support Plan) ---
export async function handleSupport(userInput: string, age: string) {
  const ageContext =
    age === '4 years' ? 'التمهيدي الأول (Moyenne Section)' : 'التمهيدي الثاني (Grande Section)';
  const prompt = `You are a special education teacher. Your task is to create a simplified individual support plan for a virtual student (level '${ageContext}') facing difficulty in a specific area. The difficulty is: "${userInput}". The plan should have 2-3 simple, actionable steps.

Provide the response in both Arabic and French.
Provide ONLY the plan, without any introduction or conclusion.`;
  return generateBilingualContent(prompt);
}
