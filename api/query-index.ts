import { Index } from "@upstash/vector";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
      throw new Error('UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN are required');
    }

    const index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });

    const namespace = process.env.UPSTASH_VECTOR_INDEX_NAMESPACE || "docusaurus-ai-search-upstash";
    const results = await index.query({
      topK: 15,
      data: query,
      includeMetadata: true,
      includeData: true,
      includeVectors: false,
    },{
      namespace
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
}
