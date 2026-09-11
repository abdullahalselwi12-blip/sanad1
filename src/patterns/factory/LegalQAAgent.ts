import type { Agent } from './Agent';

export type AgentExecutor = (
  input: string
) => Promise<{
  answer: string;
  articles?: import('@/types').LawArticle[];
  lawTitle?: string;
}>;

export class LegalQAAgent implements Agent {
  constructor(
    private readonly executor: AgentExecutor
  ) {}

  getName(): string {
    return 'Legal QA Agent';
  }

  async execute(input: string) {
    return this.executor(input);
  }
}