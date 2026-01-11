import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.3.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topicContent, topicTitle, gradeLevel, questionCount = 5, difficulty = 'medium' } = await req.json();
    
    const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!HUGGING_FACE_TOKEN) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN is not configured');
    }

    const hf = new HfInference(HUGGING_FACE_TOKEN);

    const prompt = `<s>[INST] You are an expert educator creating a quiz for students.

Topic: ${topicTitle}
Grade Level: ${gradeLevel || 'high_school'}
Difficulty: ${difficulty}
Number of Questions: ${questionCount}

Topic Content:
${topicContent}

Generate exactly ${questionCount} multiple choice questions based on this content. 
Each question should have 4 options with only one correct answer.

Return your response as a valid JSON array with this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]

Only return the JSON array, no other text. [/INST]`;

    console.log("Generating quiz for topic:", topicTitle);

    const response = await hf.textGeneration({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      inputs: prompt,
      parameters: {
        max_new_tokens: 2048,
        temperature: 0.7,
        return_full_text: false,
      }
    });

    const content = response.generated_text || "[]";
    
    // Try to parse the JSON from the response
    let questions = [];
    try {
      // Extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse quiz questions:", parseError);
      // Return a fallback quiz structure
      questions = [{
        question: `What is the main concept of ${topicTitle}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: 0,
        explanation: "This is a placeholder question. Please regenerate the quiz."
      }];
    }

    console.log("Quiz generated with", questions.length, "questions");

    return new Response(
      JSON.stringify({ 
        title: `${topicTitle} Quiz`,
        questions 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error in generate-quiz function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
