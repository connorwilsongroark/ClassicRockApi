import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AlbumArtist } from "@/api/albumsApi";
import { getArtists } from "@/api/artistsApi";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlbumArtistMutations } from "@/hooks/useAlbumArtistMutations";

type AddAlbumArtistDialogProps = {
  albumId: string;
  currentArtists: AlbumArtist[];
};

const artistRoles = [
  { value: "1", label: "Primary" },
  { value: "2", label: "Featured" },
  { value: "3", label: "Composer" },
  { value: "4", label: "Producer" },
  { value: "5", label: "Various" },
];

export function AddAlbumArtistDialog({
  albumId,
  currentArtists,
}: AddAlbumArtistDialogProps) {
  const { addArtistMutation } = useAlbumArtistMutations(albumId);

  const [open, setOpen] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [selectedRole, setSelectedRole] = useState("1");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: allArtists = [], isLoading } = useQuery({
    queryKey: ["artists"],
    queryFn: getArtists,
  });

  const availableArtists = useMemo(() => {
    const currentArtistIds = new Set(
      currentArtists.map((artist) => artist.artistId),
    );

    return allArtists.filter((artist) => !currentArtistIds.has(artist.id));
  }, [allArtists, currentArtists]);

  function resetForm() {
    setSelectedArtistId("");
    setSelectedRole("1");
    setFormError(null);
  }

  function handleAddArtist() {
    setFormError(null);

    if (!selectedArtistId) {
      setFormError("Please select an artist.");
      return;
    }

    addArtistMutation.mutate(
      {
        artistId: selectedArtistId,
        role: Number(selectedRole),
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
        <Button size='sm'>Add Artist</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Artist</DialogTitle>
          <DialogDescription>
            Associate an existing artist with this album.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Artist</Label>

            <Select
              value={selectedArtistId}
              onValueChange={(value) => {
                setSelectedArtistId(value);
                setFormError(null);
              }}
              disabled={isLoading || availableArtists.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoading
                      ? "Loading artists..."
                      : availableArtists.length === 0
                        ? "No available artists"
                        : "Select an artist"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {availableArtists.map((artist) => (
                  <SelectItem key={artist.id} value={artist.id}>
                    {artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Role</Label>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder='Select role' />
              </SelectTrigger>

              <SelectContent>
                {artistRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {formError && <p className='text-sm text-destructive'>{formError}</p>}

        {addArtistMutation.isError && (
          <p className='text-sm text-destructive'>
            Could not add artist to album.
          </p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleAddArtist}
            disabled={
              addArtistMutation.isPending ||
              isLoading ||
              availableArtists.length === 0
            }
          >
            {addArtistMutation.isPending ? "Adding..." : "Add Artist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
