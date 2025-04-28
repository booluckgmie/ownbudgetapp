
"use client";

import type { Commitment } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label'; // Import Label component


interface StatsDashboardProps {
  income: number;
  commitments: Commitment[];
}

export function StatsDashboard({ income, commitments }: StatsDashboardProps) {
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
    { name: 'Paid', value: totalPaid, color: 'hsl(var(--accent))' }, // Green
    { name: 'Unpaid', value: totalUnpaid, color: 'hsl(var(--muted))' }, // Gray
  ];

  // Determine badge color based on remaining balance
  let balanceColor: "default" | "destructive" | "secondary" | "outline" | null | undefined = "default";
  if (remainingBalanceVsUnpaid < 0) {
     balanceColor = "destructive";
  } else if (remainingBalanceVsUnpaid === 0) {
     balanceColor = "secondary";
  } else {
     balanceColor = "default"; // using primary color via default badge style
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quest Summary</CardTitle>
        <CardDescription>Your financial overview for this quest.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats Section */}
        <div className="md:col-span-2 space-y-4">
           <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
             <span className="text-muted-foreground">Total Income</span>
             <span className="font-semibold">{formatCurrency(income)}</span>
           </div>
           <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
             <span className="text-muted-foreground">Total Paid</span>
             <span className="font-semibold text-accent">{formatCurrency(totalPaid)}</span>
           </div>
           <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
             <span className="text-muted-foreground">Total Unpaid</span>
             <span className="font-semibold">{formatCurrency(totalUnpaid)}</span>
           </div>
           <div className="flex justify-between items-center p-3 border border-primary/20 rounded-lg">
             <span className="font-medium">Remaining Balance <small>(vs. Unpaid)</small></span>
             <Badge variant={balanceColor} className="text-lg">{formatCurrency(remainingBalanceVsUnpaid)}</Badge>
           </div>
           <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg text-sm">
              <span className="text-muted-foreground">Remaining After All Commitments</span>
              <span className={`font-medium ${remainingAfterAllCommitments < 0 ? 'text-destructive' : ''}`}>{formatCurrency(remainingAfterAllCommitments)}</span>
           </div>

            <div className="pt-4">
                <Label className="text-sm text-muted-foreground mb-1 block">Paid Progress ({percentagePaid.toFixed(0)}%)</Label>
                <Progress value={percentagePaid} aria-label={`${percentagePaid.toFixed(0)}% of commitments paid`} className="h-3" />
            </div>
        </div>

         {/* Pie Chart Section */}
         <div className="md:col-span-1 flex flex-col items-center justify-center min-h-[200px]">
            {totalCommitments > 0 ? (
                 <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                       <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          labelLine={false}
                          // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} // Optional labels
                       >
                          {pieData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                       <RechartsTooltip
                          contentStyle={{
                            background: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                           }}
                           formatter={(value: number) => formatCurrency(value)}
                       />
                    </PieChart>
                 </ResponsiveContainer>
            ) : (
                <p className="text-muted-foreground text-center">Add commitments to see the chart.</p>
             )}
            {/* Legend */}
             {totalCommitments > 0 && (
                <div className="flex justify-center gap-4 mt-2 text-xs">
                    <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: 'hsl(var(--accent))' }}></span> Paid
                    </div>
                    <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: 'hsl(var(--muted))' }}></span> Unpaid
                    </div>
                </div>
             )}
         </div>
      </CardContent>
    </Card>
  );
}
