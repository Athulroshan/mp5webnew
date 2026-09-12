/**
 * AI Similarity Service — abstraction layer.
 * Returns mock suggestions now. Replace `findSimilarDesigns` implementation
 * to connect to a real AI API (Stability AI, OpenAI DALL-E, etc.).
 */

import { AISuggestion } from "./types";

// ─── Service interface ─────────────────────────────────────────────────────

export interface AISimilarityService {
  findSimilarDesigns(imageUrl: string): Promise<AISuggestion[]>;
}

// ─── Mock implementation ───────────────────────────────────────────────────

const MOCK_SUGGESTIONS: AISuggestion[] = [
  { id: "ai-1", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop", label: "Abstract Geometric" },
  { id: "ai-2", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", label: "Minimalist Wave" },
  { id: "ai-3", url: "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=300&h=300&fit=crop", label: "Floral Pattern" },
  { id: "ai-4", url: "https://images.unsplash.com/photo-1591696331111-ef9586a5b17a?w=300&h=300&fit=crop", label: "Urban Grunge" },
  { id: "ai-5", url: "https://images.unsplash.com/photo-1534312527009-56c7016453e6?w=300&h=300&fit=crop", label: "Retro Vintage" },
  { id: "ai-6", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop", label: "Bold Typography" },
];

class MockAISimilarityService implements AISimilarityService {
  async findSimilarDesigns(_imageUrl: string): Promise<AISuggestion[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1800));
    return MOCK_SUGGESTIONS;
  }
}

// ─── Singleton export ──────────────────────────────────────────────────────
// Swap this export to use a real implementation without changing any component.

export const aiService: AISimilarityService = new MockAISimilarityService();
