/**
 * AI 模块
 * AI Module
 * 
 * 提供 AI 分析、选品推荐、爆款预测等智能服务
 */

import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { BaseAgent } from './agents/base.agent';
import { AnalysisAgent } from './agents/analysis.agent';
import { SelectionAgent } from './agents/selection.agent';
import { InventoryAgent } from './agents/inventory.agent';
import { RestockAgent } from './agents/restock.agent';
import { TrendAgent } from './agents/trend.agent';

@Module({
  controllers: [AIController],
  providers: [
    AIService,
    BaseAgent,
    AnalysisAgent,
    SelectionAgent,
    InventoryAgent,
    RestockAgent,
    TrendAgent,
  ],
  exports: [AIService],
})
export class AIModule {}
