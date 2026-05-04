import { useEffect, useState } from "react";
import type { ArtistListItem } from "@/api/artistsApi";
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
} from "@/components/ui/dialog";
import { useArtistMutations } from "@/hooks/useArtistMutations";

type EditArtistDialogProps = {
  artist: ArtistListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditArtistDialog({
  artist,
  open,
  onOpenChange,
}: EditArtistDialogProps) {
  const { updateArtistMutation } = useArtistMutations();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [formedYear, setFormedYear] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!artist) return;

    setName(artist.name);
    setCountry(artist.country ?? "");
    setFormedYear(artist.formedYear === null ? "" : String(artist.formedYear));
    setFormError(null);
  }, [artist]);

  function handleUpdateArtist() {
    setFormError(null);

    if (!artist) return;

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

    updateArtistMutation.mutate(
      {
        id: artist.id,
        body: {
          name: name.trim(),
          country: country.trim() === "" ? null : country.trim(),
          formedYear: parsedFormedYear,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Artist</DialogTitle>
          <DialogDescription>Update this artist record.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='edit-artist-name'>Name</Label>
            <Input
              id='edit-artist-name'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError(null);
              }}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-artist-country'>Country</Label>
            <Input
              id='edit-artist-country'
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setFormError(null);
              }}
              placeholder='Optional'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-artist-formed-year'>Formed Year</Label>
            <Input
              id='edit-artist-formed-year'
              type='number'
              value={formedYear}
              onChange={(e) => {
                setFormedYear(e.target.value);
                setFormError(null);
              }}
              placeholder='Optional'
            />
          </div>
        </div>

        {formError && <p className='text-sm text-destructive'>{formError}</p>}

        {updateArtistMutation.isError && (
          <p className='text-sm text-destructive'>Could not update artist.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleUpdateArtist}
            disabled={updateArtistMutation.isPending || !name.trim()}
          >
            {updateArtistMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
