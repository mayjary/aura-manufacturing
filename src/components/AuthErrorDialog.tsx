import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const AuthErrorDialog: React.FC<AuthErrorDialogProps> = ({
  open,
  onOpenChange,
  message = "You need to be logged in to access this page.",
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.clear();
    onOpenChange(false);
    navigate("/");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-card border-border/50">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-destructive/10">
              <ShieldAlert className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Authentication Required</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base pt-2">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleLogin}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <LogIn className="w-4 h-4" />
            Go to Login
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AuthErrorDialog;

