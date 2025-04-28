
"use client";

import type { Quest } from '@/types';
import { useState } from 'react'; // Removed useEffect as it's not needed here
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added SelectGroup, SelectLabel
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PlusCircle, Archive, Trash2 } from 'lucide-react';

interface QuestManagerProps {
  activeQuestId: string | null;
  setActiveQuestId: (id: string | null) => void;
  onQuestUpdate: (quest: Quest) => void; // For creating new quests
  onQuestDelete: (questId: string) => void;
  onQuestArchive: (quest: Quest) => void; // Callback to handle archiving logic in parent
  quests: Quest[]; // Active quests
  archivedQuests: Quest[]; // Archived quests
}

export function QuestManager({
    activeQuestId,
    setActiveQuestId,
    onQuestUpdate,
    onQuestDelete,
    onQuestArchive,
    quests,
    archivedQuests
}: QuestManagerProps) {
  const [showNewQuestDialog, setShowNewQuestDialog] = useState(false);
  const [newQuestName, setNewQuestName] = useState('');
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [questToArchive, setQuestToArchive] = useState<Quest | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [questToDelete, setQuestToDelete] = useState<Quest | null>(null);

  // Find the currently selected quest data (could be active or archived)
  const selectedQuest = quests.find(q => q.id === activeQuestId) || archivedQuests.find(q => q.id === activeQuestId);
  const isSelectedQuestArchived = selectedQuest ? archivedQuests.some(q => q.id === selectedQuest.id) : false;


  const handleCreateNewQuest = () => {
    if (!newQuestName.trim()) return; // Basic validation

    const newQuest: Quest = {
      id: crypto.randomUUID(),
      name: newQuestName.trim(),
      income: 0,
      commitments: [],
      createdAt: Date.now(),
    };

    // Add to the main quest list (handled in parent)
    onQuestUpdate(newQuest);
    setActiveQuestId(newQuest.id); // Make the new quest active

    setNewQuestName('');
    setShowNewQuestDialog(false);
  };

  const handleArchiveClick = () => {
     if (selectedQuest && !isSelectedQuestArchived) { // Only allow archiving active quests
       setQuestToArchive(selectedQuest);
       setShowArchiveDialog(true);
     }
   };

  const confirmArchiveQuest = () => {
    if (!questToArchive) return;
    onQuestArchive(questToArchive); // Call parent handler
    setQuestToArchive(null);
    setShowArchiveDialog(false);
  };

  const handleSelectQuest = (questId: string) => {
     // Check if the selected ID exists in either list before setting
    if (quests.some(q => q.id === questId) || archivedQuests.some(q => q.id === questId)) {
       setActiveQuestId(questId);
    } else {
        console.warn("Attempted to select non-existent quest ID:", questId);
        setActiveQuestId(null); // Fallback or keep current
    }
  };

   const handleDeleteClick = () => {
      if (selectedQuest && isSelectedQuestArchived) { // Only allow deleting archived quests
        setQuestToDelete(selectedQuest);
        setShowDeleteDialog(true);
      }
   };


  const confirmDeleteQuest = () => {
    if (!questToDelete) return;
    onQuestDelete(questToDelete.id); // Call parent handler
    setQuestToDelete(null);
    setShowDeleteDialog(false);
  };


  return (
    <div className="mb-4 p-4 border rounded-lg shadow-sm bg-card">
      <h2 className="text-lg font-semibold mb-3">Quest Management</h2>
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
         {/* Select Active/Archived Quest */}
         <div className="flex-grow w-full sm:w-auto">
            <Label htmlFor="questSelect" className="sr-only">Select Quest</Label>
            <Select onValueChange={handleSelectQuest} value={activeQuestId ?? ""}>
              <SelectTrigger id="questSelect" className="w-full">
                <SelectValue placeholder="Select or Create a Quest" />
              </SelectTrigger>
              <SelectContent>
                 <SelectGroup>
                     <SelectLabel>Active Quests</SelectLabel>
                     {quests.length === 0 && <SelectItem value="no-active" disabled>No active quests</SelectItem>}
                     {quests.sort((a, b) => b.createdAt - a.createdAt).map((quest) => (
                       <SelectItem key={`active-${quest.id}`} value={quest.id}>
                         {quest.name}
                       </SelectItem>
                     ))}
                 </SelectGroup>
                 <SelectGroup>
                      <SelectLabel>Archived Quests</SelectLabel>
                      {archivedQuests.length === 0 && <SelectItem value="no-archived" disabled>No archived quests</SelectItem>}
                      {archivedQuests.sort((a, b) => b.createdAt - a.createdAt).map((quest) => (
                        <SelectItem key={`archived-${quest.id}`} value={quest.id}>
                          {quest.name} (Archived {new Date(quest.createdAt).toLocaleDateString()})
                        </SelectItem>
                      ))}
                 </SelectGroup>

              </SelectContent>
            </Select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end sm:justify-start flex-wrap">
            {/* New Quest Button */}
            <AlertDialog open={showNewQuestDialog} onOpenChange={setShowNewQuestDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <PlusCircle className="mr-2 h-4 w-4" /> New
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create New Quest</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter a name for your new spending quest. You can set the income later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Label htmlFor="newQuestName">Quest Name</Label>
                  <Input
                    id="newQuestName"
                    value={newQuestName}
                    onChange={(e) => setNewQuestName(e.target.value)}
                    placeholder="e.g., July Budget"
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setNewQuestName('')}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCreateNewQuest} disabled={!newQuestName.trim()}>
                    Create Quest
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Archive Button - Only enable if selected quest is active */}
            <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                <AlertDialogTrigger asChild>
                   <Button
                       variant="outline"
                       size="sm"
                       onClick={handleArchiveClick}
                       disabled={!selectedQuest || isSelectedQuestArchived} // Disable if no quest selected or already archived
                       className="flex-1 sm:flex-none"
                       aria-label="Archive selected quest"
                       >
                       <Archive className="mr-2 h-4 w-4" /> Archive
                   </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                   <AlertDialogHeader>
                      <AlertDialogTitle>Archive Quest?</AlertDialogTitle>
                      <AlertDialogDescription>
                         Are you sure you want to archive the quest "{questToArchive?.name}"? It will be moved to the archived list and become read-only.
                      </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setQuestToArchive(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmArchiveQuest}>Archive</AlertDialogAction>
                   </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>

           {/* Delete Button - Only enable for selected archived quests */}
           <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                 <AlertDialogTrigger asChild>
                     <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteClick}
                        disabled={!selectedQuest || !isSelectedQuestArchived} // Disable if no quest selected or it's not archived
                        className="flex-1 sm:flex-none"
                        aria-label="Delete selected quest"
                        >
                       <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                       <AlertDialogTitle>Delete Quest Permanently?</AlertDialogTitle>
                       <AlertDialogDescription>
                          Are you sure you want to permanently delete the archived quest "{questToDelete?.name}"? This action cannot be undone.
                       </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                       <AlertDialogCancel onClick={() => setQuestToDelete(null)}>Cancel</AlertDialogCancel>
                       <AlertDialogAction onClick={confirmDeleteQuest} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Permanently</AlertDialogAction>
                    </AlertDialogFooter>
                 </AlertDialogContent>
              </AlertDialog>
        </div>
      </div>
    </div>
  );
}
