export interface Agent {
  getName(): string;

  execute(input: string): Promise<{
    answer: string;
    articles?: import('@/types').LawArticle[];
    lawTitle?: string;
  }>;
}