import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGenreMutations } from "@/hooks/useGenreMutations";
import { useAuthPermissions } from "@/hooks/useAuthPermissions";

export function CreateGenreDialog() {
  const { hasPermission } = useAuthPermissions();
  const canCreateGenre = hasPermission("create:genres");

  const { createGenreMutation } = useGenreMutations();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  if (!canCreateGenre) return null;

  function resetForm() {
    setName("");
    setFormError(null);
  }

  function handleCreateGenre() {
    setFormError(null);

    if (!name.trim()) {
      setFormError("Genre name is required.");
      return;
    }

    createGenreMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          resetForm();
          setOpen(false);
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>New Genre</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Genre</DialogTitle>
          <DialogDescription>
            Add a new genre to your music catalog.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-2'>
          <Label htmlFor='create-genre-name'>Name</Label>
          <Input
            id='create-genre-name'
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormError(null);
            }}
            placeholder='Progressive Rock'
          />
        </div>

        {formError && <p className='text-sm text-destructive'>{formError}</p>}

        {createGenreMutation.isError && (
          <p className='text-sm text-destructive'>Could not create genre.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleCreateGenre}
            disabled={createGenreMutation.isPending || !name.trim()}
          >
            {createGenreMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
