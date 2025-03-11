
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleMicrophonePermission: () => void;
}

const PermissionDialog: React.FC<PermissionDialogProps> = ({
  open,
  onOpenChange,
  handleMicrophonePermission
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Microphone Permission Required</AlertDialogTitle>
          <AlertDialogDescription>
            MeetingLingo needs access to your microphone to provide real-time translation. 
            Please allow microphone access when prompted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleMicrophonePermission}>
            Grant Permission
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PermissionDialog;
