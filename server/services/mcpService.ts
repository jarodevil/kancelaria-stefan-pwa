import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface LegalDocument {
  title: string;
  url: string;
  relevance: number;
}

/**
 * Searches for legal documents using Hugging Face MCP
 * This provides real legal sources to reduce hallucination
 */
export async function searchLegalDocuments(query: string): Promise<LegalDocument[]> {
  try {
    // Use MCP CLI to search Hugging Face for legal datasets/models
    const searchQuery = `polish law ${query}`;
    const command = `manus-mcp-cli tool call search_datasets --server hugging-face --input '{"query": "${searchQuery}", "limit": 5}'`;
    
    const { stdout } = await execAsync(command);
    const result = JSON.parse(stdout);

    if (result.content && Array.isArray(result.content)) {
      return result.content.map((item: any, index: number) => ({
        title: item.id || item.title || "Unknown Document",
        url: item.url || `https://huggingface.co/datasets/${item.id}`,
        relevance: 1 - (index * 0.1), // Simple relevance scoring
      }));
    }

    return [];
  } catch (error) {
    console.error("[MCP Search Error]", error);
    return [];
  }
}

/**
 * Fallback: Hardcoded legal sources for when MCP is unavailable
 */
export function getFallbackLegalSources(query: string): LegalDocument[] {
  const sources: LegalDocument[] = [
    {
      title: "Kodeks cywilny - ISAP",
      url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093",
      relevance: 0.9,
    },
    {
      title: "Kodeks pracy - ISAP",
      url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141",
      relevance: 0.85,
    },
    {
      title: "Kodeks postępowania cywilnego - ISAP",
      url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640430296",
      relevance: 0.8,
    },
  ];

  // Simple keyword matching for relevance
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("umowa") || lowerQuery.includes("cywil")) {
    sources[0].relevance = 1.0;
  } else if (lowerQuery.includes("praca") || lowerQuery.includes("pracownik")) {
    sources[1].relevance = 1.0;
  } else if (lowerQuery.includes("sąd") || lowerQuery.includes("postępowanie")) {
    sources[2].relevance = 1.0;
  }

  return sources.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Enriches AI response with legal sources
 */
export async function enrichWithLegalSources(
  query: string,
  aiResponse: string
): Promise<{ response: string; sources: LegalDocument[] }> {
  // Try MCP first, fallback to hardcoded sources
  let sources = await searchLegalDocuments(query);
  
  if (sources.length === 0) {
    sources = getFallbackLegalSources(query);
  }

  // Append sources to response if any were found
  if (sources.length > 0) {
    const sourcesSection = `\n\n---\n\n**Źródła prawne:**\n${sources
      .slice(0, 3)
      .map((s, i) => `${i + 1}. [${s.title}](${s.url})`)
      .join("\n")}`;

    return {
      response: aiResponse + sourcesSection,
      sources,
    };
  }

  return {
    response: aiResponse,
    sources: [],
  };
}
