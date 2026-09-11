import type { Agent } from './Agent';

export type ProblemAnalysisExecutor = (
  input: string
) => Promise<{
  answer: string;
  articles?: import('@/types').LawArticle[];
  lawTitle?: string;
}>;

export class ProblemAnalysisAgent implements Agent {
  constructor(
    private readonly executor: ProblemAnalysisExecutor
  ) {}

  getName(): string {
    return 'Problem Analysis Agent';
  }

  async execute(input: string) {
    return this.executor(input);
  }
}