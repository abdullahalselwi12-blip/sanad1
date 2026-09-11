import { LegalQAAgent } from './LegalQAAgent';
import { ProblemAnalysisAgent } from './ProblemAnalysisAgent';

export type AgentExecutor = (
  input: string
) => Promise<{
  answer: string;
  articles?: import('@/types').LawArticle[];
  lawTitle?: string;
}>;

export type AgentType =
  | 'legal-qa'
  | 'problem-analysis';

export class AgentFactory {
  static create(
    type: AgentType,
    executor: AgentExecutor
  ) {
    switch (type) {
      case 'legal-qa':
        return new LegalQAAgent(executor);

      case 'problem-analysis':
        return new ProblemAnalysisAgent(executor);

      default:
        throw new Error(
          `Unsupported agent type: ${type}`
        );
    }
  }
}