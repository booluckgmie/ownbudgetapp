
"use client";

import type { Quest } from '@/types';
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  onQuestUpdate: (quest: Quest) => void;
  onQuestDelete: (questId: string) => void;
  quests: Quest[];
}

export function QuestManager({ activeQuestId, setActiveQuestId, onQuestUpdate, onQuestDelete, quests }: QuestManagerProps) {
  const [questHistory, setQuestHistory] = useLocalStorage<Quest[]>('questHistory', []);
  const [showNewQuestDialog, setShowNewQuestDialog] = useState(false);
  const [newQuestName, setNewQuestName] = useState('');
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [questToArchive, setQuestToArchive] = useState<Quest | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [questToDelete, setQuestToDelete] = useState<Quest | null>(null);


  // Filter out the active quest from history for display
  const archivedQuests = questHistory.filter(q => q.id !== activeQuestId);
  const activeQuest = quests.find(q => q.id === activeQuestId);

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

  const handleArchiveQuest = (quest: Quest) => {
    setQuestToArchive(quest);
    setShowArchiveDialog(true);
  };

  const confirmArchiveQuest = () => {
    if (!questToArchive) return;

    // Add to history if not already there
     if (!questHistory.some(q => q.id === questToArchive.id)) {
       setQuestHistory([...questHistory, questToArchive]);
     }

    // If archiving the active quest, clear the active ID
    if (activeQuestId === questToArchive.id) {
      setActiveQuestId(null);
    }

    // No need to remove from `quests` here, parent should handle it if needed based on setActiveQuestId(null)
    setQuestToArchive(null);
    setShowArchiveDialog(false);
  };

  const handleSelectQuest = (questId: string) => {
    setActiveQuestId(questId);
  };

  const handleDeleteQuest = (quest: Quest) => {
    setQuestToDelete(quest);
    setShowDeleteDialog(true);
  }

  const confirmDeleteQuest = () => {
    if (!questToDelete) return;

    // Remove from history
    setQuestHistory(questHistory.filter(q => q.id !== questToDelete.id));

    // Remove from main quests list (handled by parent)
    onQuestDelete(questToDelete.id);


    // If deleting the active quest, clear the active ID
    if (activeQuestId === questToDelete.id) {
      setActiveQuestId(null);
    }

    setQuestToDelete(null);
    setShowDeleteDialog(false);
  };


  return (
    <div className="mb-6 p-4 border rounded-lg shadow-sm bg-card">
      <h2 className="text-lg font-semibold mb-3">Quest Management</h2>
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
         {/* Select Active/Archived Quest */}
         <div className="flex-grow w-full sm:w-auto">
            <Label htmlFor="questSelect" className="sr-only">Select Quest</Label>
            <Select onValueChange={handleSelectQuest} value={activeQuestId ?? ""}>
              <SelectTrigger id="questSelect" className="w-full">
                <SelectValue placeholder="Select a Quest" />
              </SelectTrigger>
              <SelectContent>
                {activeQuest && <SelectItem key={activeQuest.id} value={activeQuest.id}>{activeQuest.name} (Active)</SelectItem>}
                {archivedQuests.sort((a, b) => b.createdAt - a.createdAt).map((quest) => (
                  <SelectItem key={quest.id} value={quest.id}>
                    {quest.name} (Archived {new Date(quest.createdAt).toLocaleDateString()})
                  </SelectItem>
                ))}
                 {quests.filter(q => q.id !== activeQuestId && !questHistory.some(hq => hq.id === q.id)).map(quest => (
                   <SelectItem key={quest.id} value={quest.id}>{quest.name}</SelectItem>
                 ))}
              </SelectContent>
            </Select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
            {/* New Quest Button */}
            <AlertDialog open={showNewQuestDialog} onOpenChange={setShowNewQuestDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> New Quest
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

            {/* Archive Button - Only show if a quest is active */}
            {activeQuest && (
              <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                <AlertDialogTrigger asChild>
                   <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleArchiveQuest(activeQuest)}>
                    <Archive className="mr-2 h-4 w-4" /> Archive Current
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                   <AlertDialogHeader>
                      <AlertDialogTitle>Archive Quest?</AlertDialogTitle>
                      <AlertDialogDescription>
                         Are you sure you want to archive the quest "{questToArchive?.name}"? You can view it later from the selection dropdown.
                      </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setQuestToArchive(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmArchiveQuest}>Archive</AlertDialogAction>
                   </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
            )}

           {/* Delete Button - Only show for archived quests */}
           {activeQuestId && questHistory.some(q => q.id === activeQuestId) && (
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                 <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteQuest(questHistory.find(q => q.id === activeQuestId)!)}>
                       <Trash2 className="h-4 w-4" />
                       <span className="sr-only">Delete Quest</span>
                    </Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                       <AlertDialogTitle>Delete Quest?</AlertDialogTitle>
                       <AlertDialogDescription>
                          Are you sure you want to permanently delete the archived quest "{questToDelete?.name}"? This action cannot be undone.
                       </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                       <AlertDialogCancel onClick={() => setQuestToDelete(null)}>Cancel</AlertDialogCancel>
                       <AlertDialogAction onClick={confirmDeleteQuest} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                 </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
      </div>


    </div>
  );
}
