import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function App() {
  return (
    <div className='flex items-center justify-center h-screen gap-4'>
      {/* Button test */}
      <Button>Click me</Button>

      {/* Dialog test */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='outline'>Open Dialog</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant='secondary'>Cancel</Button>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
