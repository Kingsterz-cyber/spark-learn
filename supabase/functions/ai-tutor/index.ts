import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.3.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, gradeLevel, topicContext } = await req.json();
    
    const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!HUGGING_FACE_TOKEN) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN is not configured');
    }

    const hf = new HfInference(HUGGING_FACE_TOKEN);

    // Build system prompt based on grade level
    const gradeLevelPrompts: Record<string, string> = {
      elementary: "Explain concepts using simple words, short sentences, and fun examples. Use analogies a young child would understand.",
      middle_school: "Explain concepts clearly with some technical terms. Use relatable examples for teenagers.",
      high_school: "Provide detailed explanations with proper terminology. Include real-world applications.",
      college: "Use advanced terminology and in-depth explanations. Reference academic concepts and theories.",
      adult: "Provide comprehensive, professional explanations suitable for lifelong learners."
    };

    const systemPrompt = `You are an intelligent, friendly AI tutor for an educational platform. 
Your role is to help students learn and understand concepts.

Grade Level: ${gradeLevel || 'high_school'}
Adaptation: ${gradeLevelPrompts[gradeLevel || 'high_school']}

${topicContext ? `Current Topic Context: ${topicContext}` : ''}

Guidelines:
- Be encouraging and supportive
- Break down complex concepts into digestible parts
- Use examples and analogies appropriate for the grade level
- Ask follow-up questions to ensure understanding
- Correct misconceptions gently
- Celebrate when the student understands something
- Keep responses concise but informative`;

    // Build the conversation prompt
    const conversationHistory = messages
      .map((m: { role: string; content: string }) => 
        `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`
      )
      .join('\n');

    const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationHistory}\n\nTutor:`;

    console.log("Sending request to HuggingFace for text generation");

    // Use text generation instead of chat completion
    const response = await hf.textGeneration({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
        return_full_text: false,
      }
    });

    const assistantMessage = response.generated_text?.trim() || "I'm sorry, I couldn't generate a response.";

    console.log("AI Tutor response generated successfully");

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error in ai-tutor function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
