
"use client";

import { useState, useEffect } from 'react';
import type { Commitment, Quest, Settings } from '@/types';
import { DEFAULT_CURRENCY } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { IncomeInput } from '@/components/income-input';
import { CommitmentList } from '@/components/commitment-list';
import { CommitmentForm } from '@/components/commitment-form';
import { StatsDashboard } from '@/components/stats-dashboard';
import { QuestManager } from '@/components/quest-manager';
import { GlobalStats } from '@/components/global-stats'; // Import GlobalStats
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getCurrencySymbol } from '@/lib/utils'; // Import utility

export function CommitmentCompassApp() {
  const [quests, setQuests] = useLocalStorage<Quest[]>('quests', []);
  const [questHistory, setQuestHistory] = useLocalStorage<Quest[]>('questHistory', []);
  const [activeQuestId, setActiveQuestId] = useLocalStorage<string | null>('activeQuestId', null);
  const [settings, setSettings] = useLocalStorage<Settings>('appSettings', { currency: DEFAULT_CURRENCY });
  const [commitmentToEdit, setCommitmentToEdit] = useState<Commitment | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);


  // Find the active quest object based on the ID
  const activeQuest = quests.find(q => q.id === activeQuestId);
  // Determine if the currently viewed quest (activeQuestId) is in the history
  const isArchived = activeQuestId ? questHistory.some(q => q.id === activeQuestId) : false;


  // Effect to ensure there's always at least one quest, or set active ID if needed
  useEffect(() => {
     // Combine active and archived quests for initial setup logic
     const allKnownQuests = [...quests, ...questHistory];

     if (allKnownQuests.length === 0) {
        const initialQuest: Quest = {
           id: crypto.randomUUID(),
           name: "My First Quest",
           income: 0,
           commitments: [],
           createdAt: Date.now(),
        };
        setQuests([initialQuest]); // Add to quests list
        setActiveQuestId(initialQuest.id); // Activate it
     } else if (!activeQuestId && quests.length > 0) {
        // If no active ID but non-archived quests exist, activate the latest non-archived one
        const sortedQuests = [...quests].sort((a, b) => b.createdAt - a.createdAt);
        setActiveQuestId(sortedQuests[0].id);
     } else if (activeQuestId && !allKnownQuests.some(q => q.id === activeQuestId)) {
         // If active ID points to a deleted quest, try activating the latest non-archived quest
         const sortedQuests = [...quests].sort((a, b) => b.createdAt - a.createdAt);
         if (sortedQuests.length > 0) {
            setActiveQuestId(sortedQuests[0].id);
         } else if (questHistory.length > 0) {
            // If no active quests left, activate the latest archived quest
             const sortedHistory = [...questHistory].sort((a, b) => b.createdAt - a.createdAt);
             setActiveQuestId(sortedHistory[0].id);
         } else {
            // If truly no quests left anywhere, set active ID to null (should trigger initial quest creation)
            setActiveQuestId(null);
         }
     } else if (!activeQuestId && quests.length === 0 && questHistory.length > 0) {
         // If no active ID, no active quests, but archived quests exist, activate the latest archived
         const sortedHistory = [...questHistory].sort((a, b) => b.createdAt - a.createdAt);
         setActiveQuestId(sortedHistory[0].id);
     }
  }, [quests, questHistory, activeQuestId, setQuests, setQuestHistory, setActiveQuestId]);


  const updateQuest = (updatedQuest: Quest) => {
    setQuests(prevQuests => {
      const index = prevQuests.findIndex(q => q.id === updatedQuest.id);
      if (index > -1) {
        // Update existing quest in active list
        const newQuests = [...prevQuests];
        newQuests[index] = updatedQuest;
        return newQuests;
      } else {
        // Add new quest to active list
        return [...prevQuests, updatedQuest];
      }
    });
    // Also update in history if it exists there
    setQuestHistory(prevHistory => {
        const index = prevHistory.findIndex(q => q.id === updatedQuest.id);
        if (index > -1) {
           const newHistory = [...prevHistory];
           newHistory[index] = updatedQuest;
           return newHistory;
        }
        return prevHistory; // Don't add to history here, only update
    });
  };

   const deleteQuest = (questId: string) => {
       setQuests(prevQuests => prevQuests.filter(q => q.id !== questId));
       setQuestHistory(prevHistory => prevHistory.filter(q => q.id !== questId)); // Remove from history too
       // Active quest handling is done in useEffect
   };

   const archiveQuest = (questToArchive: Quest) => {
       // Remove from active quests list
       setQuests(prevQuests => prevQuests.filter(q => q.id !== questToArchive.id));
       // Add to history if not already there
       setQuestHistory(prevHistory => {
           if (!prevHistory.some(q => q.id === questToArchive.id)) {
               return [...prevHistory, questToArchive];
           }
           return prevHistory;
       });
       // If archiving the active quest, clear the active ID (useEffect will handle selecting next)
       if (activeQuestId === questToArchive.id) {
          setActiveQuestId(null);
       }
   };

  const handleIncomeChange = (newIncome: number) => {
    if (activeQuest && !isArchived) {
      updateQuest({ ...activeQuest, income: newIncome });
    }
  };

   const handleAddCommitment = (name: string, value: number) => {
     if (activeQuest && !isArchived) {
       const newCommitment: Commitment = { id: crypto.randomUUID(), name, value, paid: false };
       updateQuest({ ...activeQuest, commitments: [...activeQuest.commitments, newCommitment] });
     }
   };


   const handleEditCommitment = (updatedCommitment: Commitment) => {
      if (activeQuest && !isArchived) {
        const updatedCommitments = activeQuest.commitments.map(c =>
          c.id === updatedCommitment.id ? updatedCommitment : c
        );
        updateQuest({ ...activeQuest, commitments: updatedCommitments });
        setCommitmentToEdit(null); // Exit edit mode
      }
    };


  const handleTogglePaid = (id: string) => {
    if (activeQuest) { // Allow toggling even if archived (for viewing)
      const listToUpdate = isArchived ? questHistory : quests;
      const setList = isArchived ? setQuestHistory : setQuests;

      setList(prevList => {
          const questIndex = prevList.findIndex(q => q.id === activeQuestId);
          if (questIndex === -1) return prevList; // Should not happen

          const currentQuest = prevList[questIndex];
          const updatedCommitments = currentQuest.commitments.map(c =>
             c.id === id ? { ...c, paid: !c.paid } : c
           );

           const newList = [...prevList];
           newList[questIndex] = { ...currentQuest, commitments: updatedCommitments };
           return newList;
      });
    }
  };

  const handleDeleteCommitment = (id: string) => {
    if (activeQuest && !isArchived) {
      // If deleting the commitment being edited, cancel edit mode
      if (commitmentToEdit?.id === id) {
        setCommitmentToEdit(null);
      }
      const updatedCommitments = activeQuest.commitments.filter(c => c.id !== id);
      updateQuest({ ...activeQuest, commitments: updatedCommitments });
    }
  };

   const handleEditRequest = (commitment: Commitment) => {
      if (!isArchived) {
         setCommitmentToEdit(commitment);
      }
   };

   const handleCancelEdit = () => {
       setCommitmentToEdit(null);
   };

  const handleResetAllData = () => {
    setQuests([]);
    setQuestHistory([]); // Clear history
    setActiveQuestId(null);
    setSettings({ currency: DEFAULT_CURRENCY }); // Reset settings
    localStorage.removeItem('questHistory'); // Clear explicitly just in case
    localStorage.removeItem('activeQuestId');
    localStorage.removeItem('quests');
    localStorage.removeItem('appSettings');
    setShowResetDialog(false);
    // The useEffect will then create a new initial quest
  };

  const handleSettingsChange = (newSettings: Partial<Settings>) => {
      setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Find the full quest object from either quests or questHistory based on activeQuestId
  const currentQuestData = quests.find(q => q.id === activeQuestId) || questHistory.find(q => q.id === activeQuestId);

  const totalCommitmentsValue = currentQuestData?.commitments.reduce((sum, c) => sum + c.value, 0) ?? 0;
  const currencySymbol = getCurrencySymbol(settings.currency);

  return (
     // Changed container to allow full width on mobile and max-w on larger screens
    <div className="container mx-auto px-2 py-4 md:px-4 max-w-6xl">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary text-center sm:text-left">
           Commitment Compass
        </h1>
         <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
           <AlertDialogTrigger asChild>
               <Button variant="destructive" size="sm">
                   <RotateCcw className="mr-2 h-4 w-4" /> Reset All
               </Button>
           </AlertDialogTrigger>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Application Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                     This will permanently delete all your quests, income, commitments, history and settings. This action cannot be undone. Are you absolutely sure?
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, Reset Everything
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </header>

      {/* Global Stats and Settings */}
      <GlobalStats
          quests={quests}
          archivedQuests={questHistory}
          settings={settings}
          onSettingsChange={handleSettingsChange}
      />


       <QuestManager
          activeQuestId={activeQuestId}
          setActiveQuestId={setActiveQuestId}
          onQuestUpdate={updateQuest}
          onQuestDelete={deleteQuest}
          onQuestArchive={archiveQuest} // Pass archive function
          quests={quests} // Pass only active quests
          archivedQuests={questHistory} // Pass archived quests
       />

      {currentQuestData ? (
         <div className="space-y-4 md:space-y-6">
             <h2 className="text-xl sm:text-2xl font-semibold text-center mt-4 mb-2">
                 Viewing Quest: <span className="text-primary">{currentQuestData.name}</span>
                 {isArchived && <span className="text-sm font-normal text-muted-foreground"> (Archived)</span>}
             </h2>

             <IncomeInput
                initialIncome={currentQuestData.income}
                onIncomeChange={handleIncomeChange}
                currency={settings.currency}
                 disabled={isArchived}
             />

             {!isArchived && (
                 <CommitmentForm
                   addCommitment={handleAddCommitment}
                   editCommitment={handleEditCommitment}
                   commitmentToEdit={commitmentToEdit}
                   onEditCancel={handleCancelEdit}
                   currencySymbol={currencySymbol}
                   disabled={isArchived}
                 />
             )}

             <CommitmentList
               commitments={currentQuestData.commitments}
               onTogglePaid={handleTogglePaid}
               onDelete={handleDeleteCommitment}
               onEdit={handleEditRequest}
               totalCommitmentsValue={totalCommitmentsValue}
               currency={settings.currency}
               disabled={isArchived}
             />

             <StatsDashboard
               income={currentQuestData.income}
               commitments={currentQuestData.commitments}
               currency={settings.currency}
             />
         </div>
      ) : (
         <Card className="mt-6">
            <CardHeader>
               <CardTitle>No Quest Selected</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
                    Please select or create a quest using the 'Quest Management' section above to start tracking your commitments.
                </CardDescription>
            </CardContent>
         </Card>
      )}

       {/* Simple User Guide Section - Adjusted for mobile friendliness */}
       <Card className="mt-8">
         <CardHeader>
            <CardTitle className="text-lg">Quick Guide</CardTitle>
         </CardHeader>
         <CardContent className="text-sm text-muted-foreground space-y-1">
             <p><strong className="text-foreground">1. Global:</strong> Set currency & view overview.</p>
             <p><strong className="text-foreground">2. Manage Quests:</strong> Create, archive, delete, or select quests.</p>
             <p><strong className="text-foreground">3. Set Income:</strong> Enter income for the active quest.</p>
             <p><strong className="text-foreground">4. Add Items:</strong> List expenses (name/value) in the form.</p>
             <p><strong className="text-foreground">5. Track:</strong> Check off 'Paid' items. Edit/delete via icons.</p>
             <p><strong className="text-foreground">6. Summary:</strong> See totals & balance in the dashboard.</p>
             <p><strong className="text-foreground">7. Reset:</strong> Top-right button clears all data (caution!).</p>
         </CardContent>
       </Card>
    </div>
  );
}
