import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Custom hook for handling Firebase operations with loading and error states
 */
export function useFirebaseOperation<T = void>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (
    operation: () => Promise<T>
  ): Promise<T | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("Firebase operation failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}

/**
 * Hook for authentication operations with loading states
 */
export function useAuthOperations() {
  const { signIn, signUp, signInWithGoogle, signOut, resetPassword } = useAuth();
  const { execute, loading, error } = useFirebaseOperation();

  const handleSignIn = (email: string, password: string) =>
    execute(() => signIn(email, password));

  const handleSignUp = (email: string, password: string) =>
    execute(() => signUp(email, password));

  const handleGoogleSignIn = () => execute(() => signInWithGoogle());

  const handleSignOut = () => execute(() => signOut());

  const handleResetPassword = (email: string) =>
    execute(() => resetPassword(email));

  return {
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    loading,
    error,
  };
}
