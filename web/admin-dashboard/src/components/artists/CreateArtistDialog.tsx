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
import { useArtistMutations } from "@/hooks/useArtistMutations";
import { useAuthPermissions } from "@/hooks/useAuthPermissions";

export function CreateArtistDialog() {
  const { hasPermission } = useAuthPermissions();
  const canCreateArtist = hasPermission("create:artists");

  if (!canCreateArtist) return null;

  const { createArtistMutation } = useArtistMutations();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [formedYear, setFormedYear] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setCountry("");
    setFormedYear("");
    setFormError(null);
  }

  function handleCreateArtist() {
    setFormError(null);

    if (!name.trim()) {
      setFormError("Artist name is required.");
      return;
    }

    const parsedFormedYear =
      formedYear.trim() === "" ? null : Number(formedYear);

    if (parsedFormedYear !== null && Number.isNaN(parsedFormedYear)) {
      setFormError("Formed year must be a valid number.");
      return;
    }

    createArtistMutation.mutate(
      {
        name: name.trim(),
        country: country.trim() === "" ? null : country.trim(),
        formedYear: parsedFormedYear,
      },
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
        <Button>New Artist</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Artist</DialogTitle>
          <DialogDescription>
            Add a new artist to your music catalog.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='create-artist-name'>Name</Label>
            <Input
              id='create-artist-name'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError(null);
              }}
              placeholder='Pink Floyd'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='create-artist-country'>Country</Label>
            <Input
              id='create-artist-country'
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setFormError(null);
              }}
              placeholder='United Kingdom'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='create-artist-formed-year'>Formed Year</Label>
            <Input
              id='create-artist-formed-year'
              type='number'
              value={formedYear}
              onChange={(e) => {
                setFormedYear(e.target.value);
                setFormError(null);
              }}
              placeholder='1965'
            />
          </div>
        </div>

        {formError && <p className='text-sm text-destructive'>{formError}</p>}

        {createArtistMutation.isError && (
          <p className='text-sm text-destructive'>Could not create artist.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleCreateArtist}
            disabled={createArtistMutation.isPending || !name.trim()}
          >
            {createArtistMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
