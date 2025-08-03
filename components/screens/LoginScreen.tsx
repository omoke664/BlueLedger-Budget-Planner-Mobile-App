import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader } from '../ui/card';
import { BlueLedgerLogo } from '../BlueLedgerLogo';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { auth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface LoginScreenProps {
  onLogin: (user: any) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && !name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isSignUp) {
        // Sign up
        console.log('Attempting to sign up user:', email);
        const result = await auth.signUp(email, password, name);
        console.log('Sign up result:', result);
        
        if (result.user && !result.user.email_confirmed_at) {
          toast.success('Account created! Please check your email to confirm your account, then sign in.');
          setIsSignUp(false);
          setPassword(''); // Clear password for security
        } else if (result.user?.email_confirmed_at) {
          toast.success('Account created successfully! You can now sign in.');
          setIsSignUp(false);
          setPassword(''); // Clear password for security
        } else {
          toast.success('Account created! You can now sign in.');
          setIsSignUp(false);
          setPassword(''); // Clear password for security
        }
      } else {
        // Sign in
        console.log('Attempting to sign in user:', email);
        const { session, user } = await auth.signIn(email, password);
        console.log('Sign in result:', { session: !!session, user: !!user });
        
        if (session && user) {
          toast.success('Welcome back to BlueLedger!');
          onLogin(user);
        } else {
          throw new Error('Login failed - no session created');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // More specific error messages
      let errorMessage = 'Authentication failed';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
        setIsSignUp(false);
      } else if (error.message?.includes('Network error') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setPassword('');
    if (!isSignUp) setName('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-grid-2">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <BlueLedgerLogo size="lg" className="justify-center mb-4" />
          <p className="text-muted-foreground">Manage your finances with ease</p>
        </div>

        {/* Login/Signup Form */}
        <Card>
          <CardHeader>
            <h2 className="text-center">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            {isSignUp && (
              <p className="caption text-muted-foreground text-center">
                Join BlueLedger to start tracking your finances
              </p>
            )}
          </CardHeader>
          <CardContent className="p-grid-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up Only) */}
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="caption text-destructive">{errors.name}</p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="caption text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="caption text-destructive">{errors.password}</p>
                )}
                {isSignUp && (
                  <p className="caption text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              {/* Action Button */}
              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Please wait...
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Log In'
                )}
              </Button>

              {/* Toggle Mode */}
              <div className="text-center mt-4">
                <p className="caption text-muted-foreground">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button 
                    type="button" 
                    onClick={toggleMode}
                    className="text-primary hover:underline"
                    disabled={isLoading}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>

              {/* Demo Notice */}
              {!isSignUp && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="caption text-muted-foreground text-center">
                    Demo App: Create an account to get started with BlueLedger
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}