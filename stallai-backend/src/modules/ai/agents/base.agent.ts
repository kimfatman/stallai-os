/**
 * AI 代理基类
 * Base AI Agent
 * 
 * 所有 AI 代理的基类，提供通用能力
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export abstract class BaseAgent {
  protected apiKey: string;
  protected model: string;
  protected maxTokens: number;
  protected temperature: number;

  constructor(protected configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview');
    this.maxTokens = this.configService.get<number>('OPENAI_MAX_TOKENS', 2000);
    this.temperature = this.configService.get<number>('AI_TEMPERATURE', 0.7);
  }

  /**
   * 调用 AI 模型
   */
  protected async callAI(prompt: string): Promise<string> {
    // 如果没有配置 API Key，返回模拟数据
    if (!this.apiKey) {
      return this.getMockResponse(prompt);
    }

    // TODO: 实现实际的 OpenAI API 调用
    // const response = await openai.chat.completions.create({
    //   model: this.model,
    //   messages: [{ role: 'user', content: prompt }],
    //   temperature: this.temperature,
    //   max_tokens: this.maxTokens,
    // });
    // return response.choices[0].message.content;

    return this.getMockResponse(prompt);
  }

  /**
   * 获取模拟响应
   */
  protected abstract getMockResponse(prompt: string): string;

  /**
   * 生成提示词
   */
  protected buildPrompt(context: string, task: string): string {
    return `
请分析以下经营数据，并${task}。

背景信息：
${context}

要求：
1. 提供专业的分析和建议
2. 考虑中国市场和摆摊场景的特点
3. 语言简洁明了，便于理解
`;
  }
}
