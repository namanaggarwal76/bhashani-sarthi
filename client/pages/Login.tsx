import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthOperations } from "@/hooks/use-firebase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

// Reusable Google Icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn, signInWithGoogle, loading, error } = useAuthOperations();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate("/home");
    } catch (err) {
      // error is handled by useAuthOperations hook; navigation withheld on failure
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate("/home");
    } catch (err) {
      // error is handled by useAuthOperations hook; navigation withheld on failure
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen w-full items-center justify-center bg-transparent p-4">
  <div className="absolute inset-0 z-0 opacity-80" style={{backgroundImage: 'url(/world_map.svg)', backgroundSize: 'cover'}} />
      <motion.div 
        className="z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter">Sarthi</h1>
          <p className="text-muted-foreground">Sign in to your digital travel companion</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
=======
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('landing.title')}</CardTitle>
          <CardDescription>{t('landing.subtitle')}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
>>>>>>> origin/main
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
<<<<<<< HEAD
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
=======
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
>>>>>>> origin/main
            </div>
            <div className="space-y-2">
<<<<<<< HEAD
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            </div>
            <Button type="submit" className="w-full !mt-6" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="my-6 flex items-center gap-4">
            <div className="flex-grow border-t"></div>
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-grow border-t"></div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
            <GoogleIcon /> Continue with Google
          </Button>
          
          <div className="mt-6 text-center text-sm">
            <p>
              Don't have an account?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/signup")}>
                Sign up
              </Button>
            </p>
            <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground" onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </Button>
          </div>
        </div>
      </motion.div>
=======
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? `${t('common.loading')}` : t('auth.login')}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('auth.or')}
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t('auth.loginWithGoogle')}
          </Button>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="link"
            className="text-sm"
            onClick={() => navigate("/signup")}
          >
            {t('auth.dontHaveAccount')}
          </Button>
          <Button
            type="button"
            variant="link"
            className="text-sm"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </Button>
        </CardFooter>
      </Card>
>>>>>>> origin/main
    </div>
  );
}