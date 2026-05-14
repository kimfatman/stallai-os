/**
 * AI Agent 子模块
 * 包含所有专用AI Agent
 */
import { Module } from '@nestjs/common';
import { AnalysisAgent } from './analysis.agent';
import { SelectionAgent } from './selection.agent';
import { InventoryAgent } from './inventory.agent';
import { RestockAgent } from './restock.agent';
import { TrendAgent } from './trend.agent';
import { DailyReportAgent } from './daily-report.agent';

@Module({
  providers: [
    AnalysisAgent,
    SelectionAgent,
    InventoryAgent,
    RestockAgent,
    TrendAgent,
    DailyReportAgent,
  ],
  exports: [
    AnalysisAgent,
    SelectionAgent,
    InventoryAgent,
    RestockAgent,
    TrendAgent,
    DailyReportAgent,
  ],
})
export class AIModule {}
