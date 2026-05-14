/**
 * AI工具函数
 * 包含LLM调用、缓存、错误处理等工具
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { RedisService } from '../../cache/redis.service';
import { ITokenUsage } from '../interfaces/agent.interface';

/**
 * LLM提供商标记
 */
export type LLMProvider = 'openai' | 'deepseek';

/**
 * 聊天消息
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

/**
 * 聊天完成选项
 */
export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  functions?: any[];
  function_call?: any;
}

/**
 * 聊天完成结果
 */
export interface ChatCompletionResult {
  content: string;
  usage?: ITokenUsage;
  finishReason?: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
}

/**
 * OpenAI服务
 */
@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private openai: OpenAI;
  private deepseek: OpenAI;
  private readonly cache: Map<string, { data: any; expiry: number }> = new Map();
  private readonly defaultModel = 'gpt-4';
  private readonly deepseekModel = 'deepseek-chat';

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService?: RedisService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY') || process.env.OPENAI_API_KEY,
    });
    
    this.deepseek = new OpenAI({
      apiKey: this.configService.get<string>('DEEPSEEK_API_KEY') || process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    });
  }

  /**
   * 获取LLM客户端
   */
  private getClient(provider: LLMProvider = 'openai'): OpenAI {
    return provider === 'deepseek' ? this.deepseek : this.openai;
  }

  /**
   * 获取模型名称
   */
  private getModelName(provider: LLMProvider, model?: string): string {
    if (model) return model;
    return provider === 'deepseek' ? this.deepseekModel : this.defaultModel;
  }

  /**
   * 计算缓存键
   */
  private generateCacheKey(messages: ChatMessage[], options?: Partial<ChatCompletionOptions>): string {
    const content = JSON.stringify({ messages, options });
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `llm:${Math.abs(hash).toString(16)}`;
  }

  /**
   * 获取缓存
   */
  async getCache<T>(key: string): Promise<T | null> {
    // 优先使用Redis
    if (this.redisService) {
      const cached = await this.redisService.get(key);
      if (cached) {
        this.logger.debug(`Cache hit (Redis): ${key}`);
        return JSON.parse(cached);
      }
    }
    
    // 回退到内存缓存
    const memCached = this.cache.get(key);
    if (memCached && memCached.expiry > Date.now()) {
      this.logger.debug(`Cache hit (Memory): ${key}`);
      return memCached.data as T;
    }
    
    return null;
  }

  /**
   * 设置缓存
   */
  async setCache(key: string, data: any, ttl: number = 3600): Promise<void> {
    // 优先使用Redis
    if (this.redisService) {
      await this.redisService.set(key, JSON.stringify(data), ttl);
    }
    
    // 同时设置内存缓存
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl * 1000,
    });
  }

  /**
   * 清除缓存
   */
  async clearCache(pattern?: string): Promise<void> {
    if (this.redisService && pattern) {
      await this.redisService.del(pattern);
    }
    
    if (!pattern) {
      this.cache.clear();
    } else {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * 聊天完成
   */
  async chat(
    options: ChatCompletionOptions,
    provider: LLMProvider = 'openai',
  ): Promise<ChatCompletionResult> {
    const client = this.getClient(provider);
    const model = this.getModelName(provider, options.model);
    
    // 检查缓存
    if (options.stream !== true) {
      const cacheKey = this.generateCacheKey(options.messages, options);
      const cached = await this.getCache<ChatCompletionResult>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const startTime = Date.now();
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const response = await client.chat.completions.create({
          model,
          messages: options.messages as any,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2000,
          stream: options.stream ?? false,
          functions: options.functions,
          function_call: options.function_call,
        });

        if (options.stream) {
          return {
            content: '',
            usage: undefined,
            finishReason: 'streaming',
          };
        }

        const result = response as any;
        const usage = result.usage ? {
          promptTokens: result.usage.prompt_tokens,
          completionTokens: result.usage.completion_tokens,
          totalTokens: result.usage.total_tokens,
          model,
          cost: this.calculateCost(result.usage, provider),
        } : undefined;

        const choice = result.choices[0];
        const content = choice.message?.content || '';
        const functionCall = choice.message?.function_call;

        const chatResult: ChatCompletionResult = {
          content,
          usage,
          finishReason: choice.finish_reason,
          functionCall: functionCall ? {
            name: functionCall.name,
            arguments: typeof functionCall.arguments === 'string' 
              ? functionCall.arguments 
              : JSON.stringify(functionCall.arguments),
          } : undefined,
        };

        // 缓存结果
        if (!options.stream) {
          const cacheKey = this.generateCacheKey(options.messages, options);
          await this.setCache(cacheKey, chatResult, 3600);
        }

        this.logger.log(
          `LLM call completed: model=${model}, tokens=${usage?.totalTokens || 0}, ` +
          `time=${Date.now() - startTime}ms`,
        );

        return chatResult;

      } catch (error: any) {
        retries++;
        this.logger.error(`LLM call failed (attempt ${retries}/${maxRetries}): ${error.message}`);
        
        if (retries >= maxRetries) {
          // 尝试fallback
          if (provider === 'openai') {
            this.logger.warn('Falling back to DeepSeek...');
            return this.chat(options, 'deepseek');
          }
          throw error;
        }
        
        // 指数退避
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * 流式聊天
   */
  async *streamChat(
    options: ChatCompletionOptions,
    provider: LLMProvider = 'openai',
  ): AsyncGenerator<string, void, unknown> {
    const client = this.getClient(provider);
    const model = this.getModelName(provider, options.model);

    try {
      const stream = await client.chat.completions.create({
        model,
        messages: options.messages as any,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error: any) {
      this.logger.error(`Stream error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 计算成本
   */
  private calculateCost(usage: any, provider: LLMProvider): number {
    // OpenAI定价 (per 1K tokens)
    const openaiPrices = {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
    };

    // DeepSeek定价
    const deepseekPrices = {
      'deepseek-chat': { prompt: 0.001, completion: 0.002 },
    };

    const prices = provider === 'deepseek' ? deepseekPrices : openaiPrices;
    const modelPrices = prices[this.getModelName(provider)] || prices['gpt-4'];

    return (
      (usage.prompt_tokens / 1000) * modelPrices.prompt +
      (usage.completion_tokens / 1000) * modelPrices.completion
    );
  }

  /**
   * 提取结构化数据
   */
  async extractStructuredData<T>(
    systemPrompt: string,
    userContent: string,
    schema: object,
    provider?: LLMProvider,
  ): Promise<T> {
    const options: ChatCompletionOptions = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      maxTokens: 4000,
    };

    const result = await this.chat(options, provider);
    
    // 尝试解析JSON
    try {
      // 提取JSON块
      let jsonStr = result.content;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                       jsonStr.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
      }
      
      return JSON.parse(jsonStr) as T;
    } catch (error) {
      this.logger.error('Failed to parse structured data:', result.content);
      throw new Error('Failed to extract structured data from LLM response');
    }
  }

  /**
   * 批量处理
   */
  async batchChat(
    requests: ChatCompletionOptions[],
    provider: LLMProvider = 'openai',
    concurrency: number = 3,
  ): Promise<ChatCompletionResult[]> {
    const results: ChatCompletionResult[] = [];
    const chunks: ChatCompletionOptions[][] = [];
    
    // 分批处理
    for (let i = 0; i < requests.length; i += concurrency) {
      chunks.push(requests.slice(i, i + concurrency));
    }
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(req => this.chat(req, provider)),
      );
      results.push(...chunkResults);
    }
    
    return results;
  }
}

/**
 * 提示词构建器
 */
@Injectable()
export class PromptBuilder {
  private readonly logger = new Logger(PromptBuilder.name);

  /**
   * 构建系统提示词
   */
  buildSystemPrompt(
    role: string,
    context: string,
    constraints: string[],
    outputFormat?: string,
  ): string {
    const parts = [
      `# 角色`,
      role,
      ``,
      `# 背景上下文`,
      context,
      ``,
      `# 约束条件`,
      ...constraints.map((c, i) => `${i + 1}. ${c}`),
    ];

    if (outputFormat) {
      parts.push(``, `# 输出格式`, outputFormat);
    }

    return parts.join('\n');
  }

  /**
   * 构建用户提示词
   */
  buildUserPrompt(
    data: Record<string, any>,
    task: string,
    examples?: { input: string; output: string }[],
  ): string {
    const parts = [
      `# 任务`,
      task,
      ``,
      `# 数据`,
      this.formatData(data),
    ];

    if (examples && examples.length > 0) {
      parts.push(``, `# 示例`);
      examples.forEach((ex, i) => {
        parts.push(``, `## 示例 ${i + 1}`, `输入: ${ex.input}`, `输出: ${ex.output}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * 格式化数据
   */
  private formatData(data: Record<string, any>, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    const lines: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        lines.push(`${spaces}${key}: 无`);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${spaces}${key}:`);
        lines.push(this.formatData(value as Record<string, any>, indent + 1));
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          lines.push(`${spaces}${key}: []`);
        } else {
          lines.push(`${spaces}${key}:`);
          value.forEach((item, i) => {
            if (typeof item === 'object') {
              lines.push(`${spaces}  - ${JSON.stringify(item)}`);
            } else {
              lines.push(`${spaces}  - ${item}`);
            }
          });
        }
      } else {
        lines.push(`${spaces}${key}: ${value}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * 添加few-shot示例
   */
  addFewShotExamples(
    examples: { input: string; output: string; explanation?: string }[],
  ): string {
    return examples
      .map((ex, i) => {
        const parts = [
          ``,
          `--- 示例 ${i + 1} ---`,
          `输入:`,
          ex.input,
          `输出:`,
          ex.output,
        ];
        if (ex.explanation) {
          parts.push(`解释:`, ex.explanation);
        }
        return parts.join('\n');
      })
      .join('\n');
  }
}

/**
 * 错误处理工具
 */
export class AIErrorHandler {
  static readonly logger = new Logger('AIErrorHandler');

  /**
   * 处理LLM错误
   */
  static handleLLMError(error: any, context: string): never {
    const errorTypes = {
      '429': { message: 'API rate limit exceeded', retry: true },
      '500': { message: 'OpenAI server error', retry: true },
      '401': { message: 'Invalid API key', retry: false },
      '403': { message: 'Access forbidden', retry: false },
      'timeout': { message: 'Request timeout', retry: true },
      'network': { message: 'Network error', retry: true },
    };

    const errorCode = error.status || error.code;
    const errorInfo = errorTypes[errorCode] || { message: error.message, retry: false };

    this.logger.error(`[${context}] LLM Error: ${errorInfo.message}`, error.stack);

    throw new AIException(
      errorInfo.message,
      'LLM_ERROR',
      errorCode,
      errorInfo.retry,
    );
  }

  /**
   * 处理解析错误
   */
  static handleParseError(error: any, content: string, context: string): never {
    this.logger.error(`[${context}] Parse Error: ${error.message}`);
    this.logger.debug(`Content: ${content.substring(0, 500)}...`);

    throw new AIException(
      'Failed to parse LLM response',
      'PARSE_ERROR',
      'PARSE',
      false,
    );
  }
}

/**
 * AI异常
 */
export class AIException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: string | number,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = 'AIException';
  }
}

/**
 * 验证器工具
 */
export class AIValidator {
  /**
   * 验证数据完整性
   */
  static validateRequired(data: any, fields: string[]): void {
    const missing: string[] = [];
    for (const field of fields) {
      if (data[field] === undefined || data[field] === null) {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      throw new AIException(
        `Missing required fields: ${missing.join(', ')}`,
        'VALIDATION_ERROR',
        undefined,
        false,
      );
    }
  }

  /**
   * 验证数据类型
   */
  static validateType(value: any, expectedType: string): boolean {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    return actualType === expectedType;
  }

  /**
   * 验证数值范围
   */
  static validateRange(
    value: number,
    min: number,
    max: number,
    fieldName: string,
  ): void {
    if (value < min || value > max) {
      throw new AIException(
        `${fieldName} must be between ${min} and ${max}, got ${value}`,
        'VALIDATION_ERROR',
        undefined,
        false,
      );
    }
  }
}
