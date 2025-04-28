
"use client";

import type { Commitment } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label"; // Corrected import path


interface StatsDashboardProps {
  income: number;
  commitments: Commitment[];
  currency: string; // Added currency prop
}

export function StatsDashboard({ income, commitments, currency }: StatsDashboardProps) {
  const totalPaid = commitments
    .filter(c => c.paid)
    .reduce((sum, c) => sum + c.value, 0);

  const totalUnpaid = commitments
    .filter(c => !c.paid)
    .reduce((sum, c) => sum + c.value, 0);

   const totalCommitments = totalPaid + totalUnpaid;

   // Calculate remaining balance based on income minus *all* commitments (paid or unpaid)
   // to show how much is left after accounting for everything planned.
   const remainingAfterAllCommitments = income - totalCommitments;

   // Calculate remaining budget specifically against *unpaid* items.
   const remainingBalanceVsUnpaid = income - totalUnpaid;


  const percentagePaid = totalCommitments > 0 ? (totalPaid / totalCommitments) * 100 : 0;

  const pieData = [
      // Filter out categories with 0 value to prevent chart errors/weird display
      ...(totalPaid > 0 ? [{ name: 'Paid', value: totalPaid, color: 'hsl(var(--accent))' }] : []), // Green
      ...(totalUnpaid > 0 ? [{ name: 'Unpaid', value: totalUnpaid, color: 'hsl(var(--muted))' }] : []), // Gray
  ];

  // Determine badge color based on remaining balance
  let balanceColor: "default" | "destructive" | "secondary" | "outline" | null | undefined = "default";
  if (remainingBalanceVsUnpaid < 0) {
     balanceColor = "destructive";
  } else if (remainingBalanceVsUnpaid === 0 && totalCommitments > 0) { // Only show secondary if there are commitments
     balanceColor = "secondary";
  } else {
     balanceColor = "default"; // using primary color via default badge style
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
     const RADIAN = Math.PI / 180;
     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
     const x = cx + radius * Math.cos(-midAngle * RADIAN);
     const y = cy + radius * Math.sin(-midAngle * RADIAN);

     // Only show label if percent is significant
     if (percent < 0.05) return null;

     return (
       <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
         {`${name} ${(percent * 100).toFixed(0)}%`}
       </text>
     );
   };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Quest Summary</CardTitle>
        <CardDescription>Your financial overview for this quest.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Stats Section */}
        <div className="md:col-span-2 space-y-3">
           <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
             <span className="text-muted-foreground text-sm">Total Income</span>
             <span className="font-semibold">{formatCurrency(income, currency)}</span>
           </div>
           <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
             <span className="text-muted-foreground text-sm">Total Paid</span>
             <span className="font-semibold text-accent">{formatCurrency(totalPaid, currency)}</span>
           </div>
           <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
             <span className="text-muted-foreground text-sm">Total Unpaid</span>
             <span className="font-semibold">{formatCurrency(totalUnpaid, currency)}</span>
           </div>
           <div className="flex justify-between items-center p-3 border border-primary/20 rounded-lg">
             <span className="font-medium text-sm">Balance vs Unpaid</span>
             <Badge variant={balanceColor} className="text-base">{formatCurrency(remainingBalanceVsUnpaid, currency)}</Badge>
           </div>
           <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg text-sm">
              <span className="text-muted-foreground">Balance vs All</span>
              <span className={`font-medium ${remainingAfterAllCommitments < 0 ? 'text-destructive' : ''}`}>{formatCurrency(remainingAfterAllCommitments, currency)}</span>
           </div>

            <div className="pt-2">
                <Label className="text-xs text-muted-foreground mb-1 block">Paid Progress</Label>
                <Progress value={percentagePaid} aria-label={`${percentagePaid.toFixed(0)}% of commitments paid`} className="h-2" />
            </div>
        </div>

         {/* Pie Chart Section */}
         <div className="md:col-span-1 flex flex-col items-center justify-center min-h-[200px] md:border-l md:pl-6">
            {pieData.length > 0 ? (
                 <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                       <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          fill="#8884d8"
                          paddingAngle={pieData.length > 1 ? 5 : 0} // No padding if only one segment
                          dataKey="value"
                          labelLine={false}
                           label={renderCustomizedLabel} // Use custom label
                       >
                          {pieData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} /> // Added stroke for better definition
                          ))}
                       </Pie>
                       <RechartsTooltip
                          contentStyle={{
                            background: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                            padding: '8px 12px',
                           }}
                           formatter={(value: number, name: string) => [`${formatCurrency(value, currency)}`, name]}
                           itemStyle={{ padding: '0 0 4px 0' }}
                           labelStyle={{ marginBottom: '4px', fontWeight: '600'}}
                       />
                         {/* Optional: Add a simple legend if labels are too cluttered */}
                         {/* <Legend verticalAlign="bottom" height={36}/> */}
                    </PieChart>
                 </ResponsiveContainer>
            ) : (
                <p className="text-muted-foreground text-center text-sm px-4">Add income and commitments to see the summary chart.</p>
             )}
            {/* Legend (moved outside chart for clarity) */}
             {pieData.length > 0 && (
                <div className="flex justify-center gap-4 mt-2 text-xs">
                    {pieData.map((entry) => (
                        <div key={entry.name} className="flex items-center">
                            <span className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: entry.color }}></span> {entry.name}
                        </div>
                    ))}
                </div>
             )}
         </div>
      </CardContent>
    </Card>
  );
}
