// apps/web/components/doctor/pdf-preview-icon.tsx
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfPreviewIconProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function PdfPreviewIcon({ onClick, disabled }: PdfPreviewIconProps) {
  return (
    <Button 
      size="sm" 
      variant="ghost" 
      onClick={onClick} 
      disabled={disabled}
      aria-label="Preview Sick Leave Certificate"
    >
      <EyeIcon className="h-4 w-4" />
    </Button>
  );
}