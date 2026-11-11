
import { GoogleGenAI } from "@google/genai";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_TEXT_MODEL=process.env.GEMINI_TEXT_MODEL;


const fetchGeminiJsonTextResponse=async(userPrompt)=>{
try{
    const ai= new GoogleGenAI({apiKey: GOOGLE_API_KEY});
    const response = await ai.models.generateContent({
        model:GEMINI_TEXT_MODEL,
        contents:userPrompt,
        config:{
       maxOutputTokens:300,
        }
      }); 
    //   console.log(response?.text);
      const text=response.text;
     return  typeof text==='string' ? text : ' '
}catch(error){
    console.log(error)
}

}

const parseJsonObjectFromGeminiText=async(row)=>{
    if(!row || typeof row!=='string'){
  return null;
  }
  let t=row.trim();
  if(t.startsWith('```')){
    t=t.replace(/^```(?:json)?/,'').replace(/\s*$/,'');    
  }
  try{
    const v=JSON.parse(t);
    return v && typeof v==='object' && !Array.isArray(v) ? v : null;
  }catch(error){
    return null;
  }
  
  }
export const assistantAnswerAgainstQuestionService=async({
    questionTitle,
    questionContent,
    answerText
})=>{

    const userPrompt = `You review whether a forum ANSWER draft addresses the QUESTION (relevance and completeness of engagement - not whether the answer is factually correct).

QUESTION TITLE:
${questionTitle}

QUESTION BODY:
${questionContent}

ANSWER DRAFT:
${answerText}

Reply with ONLY valid JSON (no markdown fences), exactly this shape:
{"level":"strong"|"partial"|"weak","note":"one short sentence"}
Rules:
- level: "strong" if the draft clearly engages with the question; "partial" if somewhat related but missing key parts of the ask; "weak" if mostly off-topic or too vague.
- note: one sentence, plain language, no markdown, under 200 characters. Frame as fit/relevance, not grading.`;
try{
    const raw=await fetchGeminiJsonTextResponse(userPrompt);
    const parsed=await parseJsonObjectFromGeminiText(raw);
    const levelRaw=parsed?.level;
    const noteRaw=parsed?.note;
    const level=levelRaw==="strong" || levelRaw==="partial" || levelRaw==="weak" ? levelRaw :"partial";
    const note = typeof noteRaw ==='string' && noteRaw.trim() ? noteRaw.trim().slice(0,280) :"could not summarize fit treat this as a partial match "
return {level,note}

}catch(error){
   
    console.error('=== GEMINI API ERROR DURING ANSWER FIT ANALYSIS ===',error);
  throw new ServiceUnavailableError('Failed to analyze answer fit. Please try again later.');
}

}

export const generateQuestionDraftCoachService=async({title,content})=>{

    const userPrompt = `You help learners write clearer technical forum posts.
  Question TITLE:
  ${title}
  
  Question BODY (markdown allowed):
  ${content}
  
  Reply with ONLY valid JSON (no markdown fences), exactly this shape:
  {"tips":["...", "..."]}
  Rules:
  - tips: array of 3 to 5 short strings (each under 120 characters).
  - Focus on: missing context (error message, expected vs actual), reproducibility, a sharper title idea if needed, tone for peers.
  - Do not claim the question is "correct" or grade homework; give constructive checklist-style tips only.`;
  try{
const raw=await fetchGeminiJsonTextResponse(userPrompt);
const parse= await parseJsonObjectFromGeminiText(raw)
let tips=Array.isArray(parse?.tips) ? parse.tips : [];
    tips=tips.slice(0,5);
    if(tips.length===0){
      tips=[
        'add any error message or exact behavior you see',
        'say what you already tried and what you expected instead'
      ];
    }
    return {tips};
  }catch(error){
    console.error('=== GEMINI API ERROR DURING QUESTION DRAFT COACH GENERATION ===',error);
    throw new ServiceUnavailableError('Failed to generate question draft coach. Please try again later.');
  }

}


