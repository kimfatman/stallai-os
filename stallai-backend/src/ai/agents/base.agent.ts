/**
 * Base Agent - AI Agent基类
 * 摆摊AI经营OS - 核心AI Agent架构
 * 
 * 架构设计:
 * - Prompt Layer: 系统提示、用户提示、few-shot示例
 * - Memory Layer: 对话历史、用户上下文、产品记忆
 * - Tool Layer: 数据获取、计算、API调用
 * - Analysis Layer: 模式识别、趋势分析、推荐生成
 */

import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../cache/redis.service';
import { LLMService, PromptBuilder, ChatMessage, ChatCompletionOptions } from '../utils/llm.service';
import {
  IAgentResult,
  IAgentContext,
  IAgentConfig,
  ITokenUsage,
  IConversationMessage,
  IAgentResult,
} from '../interfaces/agent.interface';

/**
 * Agent执行选项
 */
export interface IAgentExecutionOptions {
  context?: IAgentContext;
  useCache?: boolean;
  cacheTTL?: number;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  retries?: number;
}

/**
 * Agent执行请求
 */
export interface IAgentRequest {
  task: string;
  data?: Record<string, any>;
  context?: IAgentContext;
  options?: IAgentExecutionOptions;
}

/**
 * Agent反思结果
 */
export interface IAgentReflection {
  thought: string;
  criticism: string;
  improvement: string;
  confidence: number;
}

/**
 * 学习记录
 */
export interface ILearningRecord {
  timestamp: Date;
  task: string;
  result: any;
  feedback?: string;
  success: boolean;
}

/**
 * 默认Agent配置
 */
const DEFAULT_AGENT_CONFIG: Partial<IAgentConfig> = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 30000,
  retries: 3,
  cacheEnabled: true,
  cacheTTL: 3600,
};

/**
 * 基础Agent类
 * 所有专用Agent的基类，提供通用能力
 */
@Injectable()
export abstract class BaseAgent {
  protected readonly logger: Logger;
  protected readonly config: IAgentConfig;
  protected readonly memory: Map<string, IConversationMessage[]>;
  protected readonly learnings: ILearningRecord[];
  
  protected abstract readonly name: string;
  protected abstract readonly description: string;
  protected abstract readonly systemPrompt: string;

  constructor(
    protected readonly llmService: LLMService,
    protected readonly redisService: RedisService,
    protected readonly configService: ConfigService,
  ) {
    this.logger = new Logger(this.constructor.name);
    this.memory = new Map();
    this.learnings = [];
    
    // 合并配置
    this.config = {
      ...DEFAULT_AGENT_CONFIG as IAgentConfig,
      name: this.name,
      description: this.description,
    };
  }

  /**
   * 主执行方法
   * 完整的Agent执行流程: think -> execute -> reflect
   */
  async execute(request: IAgentRequest): Promise<IAgentResult> {
    const startTime = Date.now();
    const { task, data, context, options } = request;
    
    try {
      // 1. 思考阶段
      this.logger.debug(`[${this.name}] Starting thought process...`);
      const thoughts = await this.think(task, data, context);
      
      // 2. 执行阶段
      this.logger.debug(`[${this.name}] Executing task...`);
      const result = await this.executeInternal(task, data, context, options);
      
      // 3. 反思阶段
      this.logger.debug(`[${this.name}] Reflecting on result...`);
      const reflection = await this.reflect(task, result, context);
      
      // 4. 学习阶段
      await this.learn(task, result, reflection);
      
      // 5. 缓存结果
      if (options?.useCache !== false && this.config.cacheEnabled) {
        await this.cache(task, data, result);
      }

      return {
        success: true,
        data: {
          result,
          thoughts,
          reflection,
        },
        executionTime: Date.now() - startTime,
        metadata: {
          agent: this.name,
          model: this.config.model,
          temperature: options?.temperature ?? this.config.temperature,
        },
      };
    } catch (error: any) {
      this.logger.error(`[${this.name}] Execution failed: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        metadata: {
          agent: this.name,
          errorType: error.name || 'UnknownError',
        },
      };
    }
  }

  /**
   * 流式执行
   */
  async *stream(request: IAgentRequest): AsyncGenerator<string, void, unknown> {
    const { task, data, context, options } = request;
    
    try {
      // 构建消息
      const messages = await this.buildMessages(task, data, context);
      
      // 流式输出
      for await (const chunk of this.llmService.streamChat({
        messages,
        temperature: options?.temperature ?? this.config.temperature,
        maxTokens: options?.maxTokens ?? this.config.maxTokens,
      })) {
        yield chunk;
      }
    } catch (error: any) {
      this.logger.error(`[${this.name}] Stream failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 思考过程
   * 模拟Agent的思考过程，分析任务
   */
  protected async think(
    task: string,
    data: Record<string, any>,
    context?: IAgentContext,
  ): Promise<string> {
    const thoughtPrompt = `
# 思考过程

你是一个AI助手，正在分析以下任务:

## 任务
${task}

## 数据
${JSON.stringify(data, null, 2)}

## 用户上下文
${context ? JSON.stringify(context, null, 2) : '无'}

请详细分析:
1. 这个任务的核心目标是什么?
2. 需要考虑哪些关键因素?
3. 如何分解这个任务?
4. 预期的输出格式是什么?

请用简洁的要点回复。
`;

    try {
      const result = await this.llmService.chat({
        messages: [
          { role: 'system', content: '你是一个善于思考的AI助手。' },
          { role: 'user', content: thoughtPrompt },
        ],
        temperature: 0.5,
        maxTokens: 500,
      });
      return result.content;
    } catch (error) {
      this.logger.warn('Thinking process failed, continuing without detailed thoughts');
      return 'Task analysis completed';
    }
  }

  /**
   * 反思过程
   * 评估输出质量，提出改进建议
   */
  protected async reflect(
    task: string,
    result: any,
    context?: IAgentContext,
  ): Promise<IAgentReflection> {
    const reflectionPrompt = `
# 反思过程

## 任务
${task}

## 输出结果
${JSON.stringify(result, null, 2)}

请从以下角度反思:
1. **思考(Thought)**: 结果是否合理?逻辑是否完整?
2. **批评(Criticism)**: 有哪些潜在的错误或遗漏?
3. **改进(Improvement)**: 如何可以做得更好?
4. **置信度(Confidence)**: 你对这个结果的信心程度(0-1)?

请以JSON格式回复:
{
  "thought": "...",
  "criticism": "...",
  "improvement": "...",
  "confidence": 0.8
}
`;

    try {
      const response = await this.llmService.chat({
        messages: [
          { role: 'system', content: '你是一个批判性思维AI。' },
          { role: 'user', content: reflectionPrompt },
        ],
        temperature: 0.3,
        maxTokens: 800,
      });

      // 解析JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        thought: 'Reflection completed',
        criticism: 'No issues identified',
        improvement: 'Continue monitoring',
        confidence: 0.7,
      };
    } catch (error) {
      this.logger.warn('Reflection process failed');
      return {
        thought: 'Task completed',
        criticism: 'Unable to perform detailed reflection',
        improvement: 'Manual review recommended',
        confidence: 0.5,
      };
    }
  }

  /**
   * 学习过程
   * 从执行结果中学习，积累经验
   */
  protected async learn(
    task: string,
    result: any,
    reflection?: IAgentReflection,
  ): Promise<void> {
    const record: ILearningRecord = {
      timestamp: new Date(),
      task,
      result,
      success: true,
    };

    this.learnings.push(record);
    
    // 限制学习记录数量
    if (this.learnings.length > 100) {
      this.learnings.shift();
    }

    // 如果置信度低，记录需要改进的地方
    if (reflection && reflection.confidence < 0.6) {
      await this.recordImprovement(task, reflection.improvement);
    }
  }

  /**
   * 记录改进项
   */
  protected async recordImprovement(task: string, improvement: string): Promise<void> {
    const key = `improvements:${this.name}`;
    try {
      const existing = await this.redisService?.get(key);
      const improvements = existing ? JSON.parse(existing) : [];
      improvements.push({
        task,
        improvement,
        timestamp: new Date(),
      });
      // 只保留最近20条
      if (improvements.length > 20) {
        improvements.shift();
      }
      await this.redisService?.set(key, JSON.stringify(improvements), 86400 * 7);
    } catch (error) {
      this.logger.warn('Failed to record improvement');
    }
  }

  /**
   * 缓存结果
   */
  protected async cache(
    task: string,
    data: Record<string, any>,
    result: any,
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(task, data);
    try {
      await this.llmService.setCache(cacheKey, result, this.config.cacheTTL);
    } catch (error) {
      this.logger.warn('Failed to cache result');
    }
  }

  /**
   * 获取缓存
   */
  protected async getCache<T>(task: string, data: Record<string, any>): Promise<T | null> {
    const cacheKey = this.generateCacheKey(task, data);
    try {
      return await this.llmService.getCache<T>(cacheKey);
    } catch (error) {
      return null;
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(task: string, data: Record<string, any>): string {
    const content = `${this.name}:${task}:${JSON.stringify(data)}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `agent:${this.name}:${Math.abs(hash).toString(16)}`;
  }

  /**
   * 内部执行
   * 子类需要实现的具体执行逻辑
   */
  protected abstract executeInternal(
    task: string,
    data: Record<string, any>,
    context?: IAgentContext,
    options?: IAgentExecutionOptions,
  ): Promise<any>;

  /**
   * 构建消息
   */
  protected async buildMessages(
    task: string,
    data: Record<string, any>,
    context?: IAgentContext,
  ): Promise<ChatMessage[]> {
    const messages: ChatMessage[] = [];

    // 系统提示
    messages.push({
      role: 'system',
      content: this.buildSystemMessage(context),
    });

    // 对话历史
    if (context?.userId) {
      const history = this.getConversationHistory(context.userId);
      messages.push(...history);
    }

    // 用户消息
    messages.push({
      role: 'user',
      content: this.buildUserMessage(task, data, context),
    });

    return messages;
  }

  /**
   * 构建系统消息
   */
  protected buildSystemMessage(context?: IAgentContext): string {
    return this.systemPrompt;
  }

  /**
   * 构建用户消息
   */
  protected buildUserMessage(
    task: string,
    data: Record<string, any>,
    context?: IAgentContext,
  ): string {
    let message = `# 任务\n${task}\n\n# 数据\n`;
    
    if (Object.keys(data).length > 0) {
      message += this.formatData(data);
    } else {
      message += '无数据提供';
    }

    if (context) {
      message += `\n\n# 上下文\n`;
      message += `用户ID: ${context.userId}\n`;
      if (context.userProfile) {
        message += `用户画像: ${JSON.stringify(context.userProfile, null, 2)}\n`;
      }
    }

    return message;
  }

  /**
   * 格式化数据
   */
  protected formatData(data: Record<string, any>, indent: number = 0): string {
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
              lines.push(`${spaces}  [${i}]: ${JSON.stringify(item)}`);
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
   * 获取对话历史
   */
  protected getConversationHistory(userId: string): ChatMessage[] {
    return this.memory.get(userId) || [];
  }

  /**
   * 添加对话消息
   */
  protected addToHistory(
    userId: string,
    role: 'user' | 'assistant',
    content: string,
  ): void {
    const history = this.memory.get(userId) || [];
    history.push({
      role,
      content,
      timestamp: new Date(),
    } as ChatMessage);
    
    // 限制历史长度
    if (history.length > 20) {
      history.shift();
    }
    
    this.memory.set(userId, history);
  }

  /**
   * 清除对话历史
   */
  protected clearHistory(userId: string): void {
    this.memory.delete(userId);
  }

  /**
   * 获取学习记录
   */
  protected getLearnings(): ILearningRecord[] {
    return this.learnings;
  }

  /**
   * 获取Agent信息
   */
  getAgentInfo(): { name: string; description: string; config: IAgentConfig } {
    return {
      name: this.name,
      description: this.description,
      config: this.config,
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 测试LLM连接
      await this.llmService.chat({
        messages: [{ role: 'user', content: 'ping' }],
        maxTokens: 10,
      });
      return true;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }
}
