
"use client";

import type { Quest, Settings, } from '@/types';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface GlobalStatsProps {
  quests: Quest[];
  archivedQuests: Quest[];
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
}

export function GlobalStats({ quests, archivedQuests, settings, onSettingsChange }: GlobalStatsProps) {
  const activeQuests = quests.filter(q => !archivedQuests.some(aq => aq.id === q.id));

  const totalActiveIncome = activeQuests.reduce((sum, q) => sum + q.income, 0);
  const totalActiveCommitments = activeQuests.reduce((sum, q) => sum + q.commitments.reduce((cSum, c) => cSum + c.value, 0), 0);
  const totalActivePaid = activeQuests.reduce((sum, q) => sum + q.commitments.filter(c => c.paid).reduce((cSum, c) => cSum + c.value, 0), 0);
  const totalActiveUnpaid = totalActiveCommitments - totalActivePaid;

  const handleCurrencyChange = (newCurrencyCode: string) => {
    onSettingsChange({ currency: newCurrencyCode });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Global Overview</CardTitle>
        <CardDescription>Summary across all your quests and settings.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Currency Setting */}
        <div className="space-y-2">
          <Label htmlFor="currencySelect">Display Currency</Label>
          <Select
            value={settings.currency}
            onValueChange={handleCurrencyChange}
          >
            <SelectTrigger id="currencySelect">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quest Counts */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
             <span className="text-muted-foreground text-sm">Active Quests</span>
             <Badge variant="secondary" className="text-base">{activeQuests.length}</Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
             <span className="text-muted-foreground text-sm">Archived Quests</span>
             <Badge variant="secondary" className="text-base">{archivedQuests.length}</Badge>
          </div>
        </div>

        {/* Aggregate Financials (Optional/Example) */}
        <div className="space-y-2">
           <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
             <span className="text-muted-foreground text-sm">Total Active Income</span>
             <span className="font-semibold">{formatCurrency(totalActiveIncome, settings.currency)}</span>
           </div>
           <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
             <span className="text-muted-foreground text-sm">Total Active Unpaid</span>
             <span className="font-semibold">{formatCurrency(totalActiveUnpaid, settings.currency)}</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
