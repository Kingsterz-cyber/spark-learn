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
    const { prompt, educationalContext } = await req.json();
    
    const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!HUGGING_FACE_TOKEN) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN is not configured');
    }

    const hf = new HfInference(HUGGING_FACE_TOKEN);

    // Enhance prompt for educational context
    const enhancedPrompt = educationalContext 
      ? `Educational illustration for ${educationalContext}: ${prompt}. Clean, clear, professional educational diagram style.`
      : prompt;

    console.log("Generating image with prompt:", enhancedPrompt);

    const image = await hf.textToImage({
      inputs: enhancedPrompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    });

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log("Image generated successfully");

    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${base64}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error in generate-image function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
