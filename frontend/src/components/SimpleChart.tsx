import React from 'react';
import { DCAIntent } from '../types/dca';

interface SimpleChartProps {
  data: DCAIntent[];
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-lg mb-2">No data available</div>
          <div className="text-sm">Submit a DCA intent to see progress</div>
        </div>
      </div>
    );
  }

  // Calculate chart data
  const totalBudget = data.reduce((sum, intent) => sum + intent.totalBudget, 0);
  const totalSpent = data.reduce((sum, intent) => sum + (intent.executedPeriods * intent.perInterval), 0);
  const totalRemaining = Math.max(0, totalBudget - totalSpent);

  // Create chart points
  const chartData = data.map((intent, index) => {
    const spent = intent.executedPeriods * intent.perInterval;
    const remaining = Math.max(0, intent.totalBudget - spent);
    return {
      name: `Intent ${index + 1}`,
      spent,
      remaining,
      total: intent.totalBudget
    };
  });

  const maxValue = Math.max(...chartData.map(d => d.total));

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">{totalSpent.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Spent (USDC)</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalRemaining.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Remaining (USDC)</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{totalBudget.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Total Budget</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Chart bars */}
          {chartData.map((item, index) => {
            const x = (index / (chartData.length - 1)) * 80 + 10; // 10% margin on each side
            const width = 60 / chartData.length; // 60% of width divided by number of items
            
            const spentHeight = (item.spent / maxValue) * 60; // 60% of height
            const remainingHeight = (item.remaining / maxValue) * 60;
            
            return (
              <g key={index}>
                {/* Spent bar */}
                <rect
                  x={x}
                  y={100 - spentHeight - 20} // 20% margin at bottom
                  width={width}
                  height={spentHeight}
                  fill="#10b981"
                  opacity="0.8"
                />
                {/* Remaining bar */}
                <rect
                  x={x}
                  y={100 - spentHeight - remainingHeight - 20}
                  width={width}
                  height={remainingHeight}
                  fill="#ef4444"
                  opacity="0.8"
                />
                {/* Labels */}
                <text
                  x={x + width / 2}
                  y="95"
                  textAnchor="middle"
                  fontSize="2"
                  fill="#6b7280"
                >
                  {index + 1}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          <g transform="translate(10, 5)">
            <rect x="0" y="0" width="3" height="3" fill="#10b981" opacity="0.8"/>
            <text x="5" y="2.5" fontSize="2.5" fill="#374151">Spent</text>
            <rect x="15" y="0" width="3" height="3" fill="#ef4444" opacity="0.8"/>
            <text x="20" y="2.5" fontSize="2.5" fill="#374151">Remaining</text>
          </g>
        </svg>
      </div>

      {/* Intent Details */}
      <div className="space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm font-medium">{item.name}</span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-emerald-600">{item.spent.toFixed(2)} spent</span>
              <span className="text-red-600">{item.remaining.toFixed(2)} remaining</span>
              <span className="text-muted-foreground">{item.total.toFixed(2)} total</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleChart;
