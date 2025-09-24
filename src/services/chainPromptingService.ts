// Chain Prompting Service for Adventure Buddha

export interface ChainStep {
  id: string;
  task: string;
  prompt: string;
  parser?: (response: string) => unknown;
}

interface ChainContext {
  [key: string]: unknown;
}

export class ChainPromptingService {
  private context: ChainContext = {};

  async executeChain(steps: ChainStep[]): Promise<ChainContext> {
    for (const step of steps) {
      try {
        // Prepare the prompt with context
        const enrichedPrompt = this.enrichPromptWithContext(step.prompt);
        
        // Call the LLM API
        const response = await this.callLLM(enrichedPrompt);
        
        // Parse and store the result
        const result = step.parser ? step.parser(response) : response;
        this.context[step.id] = result;
        
        console.log(`Completed step: ${step.id} - ${step.task}`);
      } catch (error) {
        console.error(`Error in step ${step.id}:`, error);
        throw error;
      }
    }
    
    return this.context;
  }

  private enrichPromptWithContext(prompt: string): string {
    // Add context to the prompt to maintain conversation continuity
    // while keeping token usage minimal
    let enrichedPrompt = prompt;
    
    if (Object.keys(this.context).length > 0) {
      enrichedPrompt = `Context: ${JSON.stringify(this.context)}\n\nTask: ${prompt}`;
    }
    
    return enrichedPrompt;
  }

  private async callLLM(prompt: string): Promise<string> {
    // This would integrate with your LLM API
    // For now, we'll simulate a response
    // In a real implementation, this would call your backend LLM endpoint
    
    // Example integration with a backend endpoint:
    /*
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, maxTokens: 1000 }),
    });
    
    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response;
    */
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return a simulated response
    return `This is a simulated response for prompt: "${prompt.substring(0, 50)}..."`;
  }

  getContext(): ChainContext {
    return { ...this.context };
  }

  setContext(context: ChainContext): void {
    this.context = { ...context };
  }

  clearContext(): void {
    this.context = {};
  }
}

// Singleton instance for the application
export const chainPromptingService = new ChainPromptingService();