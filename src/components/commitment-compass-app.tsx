
"use client";

import { useState, useEffect } from 'react';
import type { Commitment, Quest } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { IncomeInput } from '@/components/income-input';
import { CommitmentList } from '@/components/commitment-list';
import { CommitmentForm } from '@/components/commitment-form';
import { StatsDashboard } from '@/components/stats-dashboard';
import { QuestManager } from '@/components/quest-manager';
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

export function CommitmentCompassApp() {
  const [quests, setQuests] = useLocalStorage<Quest[]>('quests', []);
  const [activeQuestId, setActiveQuestId] = useLocalStorage<string | null>('activeQuestId', null);
  const [commitmentToEdit, setCommitmentToEdit] = useState<Commitment | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Find the active quest object based on the ID
  const activeQuest = quests.find(q => q.id === activeQuestId);
  const isArchived = useLocalStorage<Quest[]>('questHistory', [])[0].some(q => q.id === activeQuestId); // Check if active quest is in history

  // Effect to ensure there's always at least one quest, or set active ID if needed
  useEffect(() => {
     if (quests.length === 0) {
        const initialQuest: Quest = {
           id: crypto.randomUUID(),
           name: "My First Quest",
           income: 0,
           commitments: [],
           createdAt: Date.now(),
        };
        setQuests([initialQuest]);
        setActiveQuestId(initialQuest.id);
     } else if (!activeQuestId && quests.length > 0) {
        // If no active ID but quests exist, activate the latest one
        const sortedQuests = [...quests].sort((a, b) => b.createdAt - a.createdAt);
        setActiveQuestId(sortedQuests[0].id);
     } else if (activeQuestId && !quests.some(q => q.id === activeQuestId)) {
        // If active ID points to a non-existent quest (e.g., after delete), activate the latest or null
        const sortedQuests = [...quests].sort((a, b) => b.createdAt - a.createdAt);
         setActiveQuestId(sortedQuests.length > 0 ? sortedQuests[0].id : null);
     }
  }, [quests, activeQuestId, setQuests, setActiveQuestId]);


  const updateQuest = (updatedQuest: Quest) => {
    setQuests(prevQuests => {
      const index = prevQuests.findIndex(q => q.id === updatedQuest.id);
      if (index > -1) {
        // Update existing quest
        const newQuests = [...prevQuests];
        newQuests[index] = updatedQuest;
        return newQuests;
      } else {
        // Add new quest
        return [...prevQuests, updatedQuest];
      }
    });
  };

   const deleteQuest = (questId: string) => {
       setQuests(prevQuests => prevQuests.filter(q => q.id !== questId));
       // Active quest handling is done in useEffect
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
    if (activeQuest && !isArchived) {
      const updatedCommitments = activeQuest.commitments.map(c =>
        c.id === id ? { ...c, paid: !c.paid } : c
      );
      updateQuest({ ...activeQuest, commitments: updatedCommitments });
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
    setActiveQuestId(null);
    localStorage.removeItem('questHistory'); // Clear history too
    localStorage.removeItem('activeQuestId'); // Clear active quest ID explicitly
     localStorage.removeItem('quests'); // Clear quests explicitly
    setShowResetDialog(false);
    // The useEffect will then create a new initial quest
  };

  const totalCommitmentsValue = activeQuest?.commitments.reduce((sum, c) => sum + c.value, 0) ?? 0;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-primary mb-2 sm:mb-0">
           Commitment Compass
        </h1>
         <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
           <AlertDialogTrigger asChild>
               <Button variant="destructive" size="sm">
                   <RotateCcw className="mr-2 h-4 w-4" /> Reset All Data
               </Button>
           </AlertDialogTrigger>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Application Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                     This will permanently delete all your quests, income, commitments, and history. This action cannot be undone. Are you absolutely sure?
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


       <QuestManager
          activeQuestId={activeQuestId}
          setActiveQuestId={setActiveQuestId}
          onQuestUpdate={updateQuest} // Pass update function
          onQuestDelete={deleteQuest}
          quests={quests}
       />

      {activeQuest ? (
         <div className="space-y-6">
             <IncomeInput
                initialIncome={activeQuest.income}
                onIncomeChange={handleIncomeChange}
                 disabled={isArchived}
             />

             {!isArchived && (
                 <CommitmentForm
                   addCommitment={handleAddCommitment}
                   editCommitment={handleEditCommitment}
                   commitmentToEdit={commitmentToEdit}
                   onEditCancel={handleCancelEdit}
                   disabled={isArchived}
                 />
             )}

             <CommitmentList
               commitments={activeQuest.commitments}
               onTogglePaid={handleTogglePaid}
               onDelete={handleDeleteCommitment}
               onEdit={handleEditRequest}
               totalCommitmentsValue={totalCommitmentsValue}
               disabled={isArchived}
             />

             <StatsDashboard
               income={activeQuest.income}
               commitments={activeQuest.commitments}
             />
         </div>
      ) : (
         <Card>
            <CardHeader>
               <CardTitle>No Active Quest</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
                    Please select a quest or create a new one using the Quest Management tools above to start tracking your commitments.
                </CardDescription>
            </CardContent>
         </Card>
      )}

       {/* Simple User Guide Section */}
       <Card className="mt-8">
         <CardHeader>
            <CardTitle>Quick Guide</CardTitle>
         </CardHeader>
         <CardContent className="text-sm text-muted-foreground space-y-2">
             <p>1. <strong className="text-foreground">Manage Quests:</strong> Use the 'Quest Management' section to create new quests, archive old ones, or select an existing quest to view/edit.</p>
             <p>2. <strong className="text-foreground">Set Income:</strong> Enter your total income for the active quest in the 'Total Income' section.</p>
             <p>3. <strong className="text-foreground">Add Commitments:</strong> Use the 'Add New Commitment' form to list your expenses (name and value).</p>
             <p>4. <strong className="text-foreground">Track Progress:</strong> Mark commitments as 'Paid' using the checkboxes in the list. Edit or delete items using the action buttons.</p>
             <p>5. <strong className="text-foreground">View Summary:</strong> Check the 'Quest Summary' dashboard for totals (paid, unpaid) and your remaining balance.</p>
             <p>6. <strong className="text-foreground">Archive/Delete:</strong> Archive the current quest when finished, or delete unwanted archived quests using the buttons in the management section.</p>
              <p>7. <strong className="text-foreground">Reset:</strong> Use the 'Reset All Data' button (top right) to clear everything and start fresh (use with caution!).</p>
         </CardContent>
       </Card>
    </div>
  );
}

