import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-1 animate-spin items-center justify-center">
      <Loader2 />
    </div>
  );
}
