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
    const { texts, operation = 'embed' } = await req.json();
    
    const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!HUGGING_FACE_TOKEN) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN is not configured');
    }

    const hf = new HfInference(HUGGING_FACE_TOKEN);

    console.log("Processing", texts.length, "texts for embedding");

    // Use a sentence embedding model
    const embeddings = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: texts,
    });

    // If operation is similarity, calculate cosine similarity between first and rest
    if (operation === 'similarity' && texts.length >= 2) {
      const embeddingsArray = embeddings as number[][];
      const queryEmbedding = embeddingsArray[0];
      const similarities = embeddingsArray.slice(1).map((embedding: number[], index: number) => {
        const dotProduct = queryEmbedding.reduce((sum, a, i) => sum + a * embedding[i], 0);
        const normA = Math.sqrt(queryEmbedding.reduce((sum, a) => sum + a * a, 0));
        const normB = Math.sqrt(embedding.reduce((sum, b) => sum + b * b, 0));
        return {
          index: index + 1,
          text: texts[index + 1],
          similarity: dotProduct / (normA * normB)
        };
      });

      // Sort by similarity
      similarities.sort((a, b) => b.similarity - a.similarity);

      return new Response(
        JSON.stringify({ similarities }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Embeddings generated successfully");

    return new Response(
      JSON.stringify({ embeddings }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error in text-embeddings function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
