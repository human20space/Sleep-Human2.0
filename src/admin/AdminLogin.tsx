import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Shield, Lock, Mail, ArrowRight, ShieldAlert, LogOut, AlertCircle } from 'lucide-react';
import { useAdminSeo } from './adminSeo';

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Dynamic SEO meta tag
  useAdminSeo();

  // Check if user is already logged in and authorized as admin
  useEffect(() => {
    async function verifyInitialSession() {
      setCheckingSession(true);

      // Check mock session first if Supabase not configured
      if (!isSupabaseConfigured || !supabase) {
        const mockAdmin = localStorage.getItem('human2_admin_session');
        if (mockAdmin) {
          try {
            const parsed = JSON.parse(mockAdmin);
            if (parsed.email && parsed.isAdmin) {
              onLoginSuccess(parsed.email);
              return;
            }
          } catch {
            // ignore
          }
        }
        setCheckingSession(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          // Check if user is in sleep_admins
          const authorized = await checkAdminAuthorization(session.user.id);
          if (authorized) {
            onLoginSuccess(session.user.email || 'admin@human2.space');
            return;
          } else {
            setIsUnauthorized(true);
          }
        }
      } catch (err) {
        console.warn('[AdminLogin] Error checking existing session:', err);
      } finally {
        setCheckingSession(false);
      }
    }

    verifyInitialSession();
  }, [onLoginSuccess]);

  async function checkAdminAuthorization(userId: string): Promise<boolean> {
    if (!supabase) return false;

    // 1. Try sleep_is_admin() RPC
    try {
      const { data: isRpcAdmin, error: rpcError } = await supabase.rpc('sleep_is_admin');
      if (!rpcError && isRpcAdmin === true) {
        return true;
      }
    } catch {
      // fallback
    }

    // 2. Direct query against sleep_admins table
    try {
      const { data, error } = await supabase
        .from('sleep_admins')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return true;
      }
    } catch {
      // ignore
    }

    return false;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // Fallback if Supabase is not configured
    if (!isSupabaseConfigured || !supabase) {
      if (cleanEmail.toLowerCase().includes('admin') || cleanEmail.toLowerCase().includes('human2')) {
        const sessionData = { email: cleanEmail, isAdmin: true };
        localStorage.setItem('human2_admin_session', JSON.stringify(sessionData));
        onLoginSuccess(cleanEmail);
      } else {
        setIsUnauthorized(true);
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error || !data.user) {
        setErrorMessage(error?.message || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Verify sleep_admins status
      const isAuthorized = await checkAdminAuthorization(data.user.id);
      if (isAuthorized) {
        onLoginSuccess(data.user.email || cleanEmail);
      } else {
        setIsUnauthorized(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    localStorage.removeItem('human2_admin_session');
    setIsUnauthorized(false);
    setEmail('');
    setPassword('');
  };

  // UNAUTHORIZED STATE:
  // "If an authenticated user is NOT in sleep_admins, show 'Not authorised' message and a sign-out button, and nothing else."
  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center p-6 text-[#1F2A28] antialiased">
        <div className="bg-white border border-[#E6DCCB] rounded-2xl p-8 max-w-sm w-full shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="font-serif-title text-2xl font-bold text-[#1F2A28]">
              Not authorised
            </h1>
            <p className="text-xs text-[#5A6663] mt-2 leading-relaxed">
              You are signed in, but your account does not have administrator privileges for Human 2.0 Sleep.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center p-6 text-[#1F2A28]">
        <div className="text-xs text-[#5A6663] flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-[#1F5F78] animate-ping" />
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col justify-between p-4 md:p-8 text-[#1F2A28] antialiased">
      {/* Top Bar with Return to Site */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1F5F78] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            H2
          </div>
          <span className="font-serif-title font-bold text-sm text-[#1F2A28]">
            Human 2.0 Sleep
          </span>
        </div>

        <button
          onClick={onNavigateHome}
          className="text-xs font-semibold text-[#1F5F78] hover:underline cursor-pointer"
        >
          View site →
        </button>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="bg-white border border-[#E6DCCB] rounded-2xl p-7 md:p-8 shadow-sm space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#1F5F78] text-xs font-semibold">
              <Shield size={14} />
              <span>ADMINISTRATOR ACCESS</span>
            </div>
            <h1 className="font-serif-title text-2xl md:text-3xl font-bold text-[#1F2A28]">
              Admin Sign In
            </h1>
            <p className="text-xs text-[#5A6663]">
              Human 2.0 Sleep Management & Publishing Console
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5A6663] block">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6663]" />
                <input
                  type="email"
                  required
                  placeholder="admin@human2.space"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DCCB] bg-[#F7F3EC]/40 text-xs text-[#1F2A28] focus:outline-none focus:border-[#1F5F78] focus:bg-white shadow-2xs transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5A6663] block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6663]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DCCB] bg-[#F7F3EC]/40 text-xs text-[#1F2A28] focus:outline-none focus:border-[#1F5F78] focus:bg-white shadow-2xs transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {!isSupabaseConfigured && (
            <div className="pt-2 border-t border-[#E6DCCB]/60 text-center">
              <p className="text-[10px] text-[#5A6663] mb-2 font-mono">
                Running in local offline mode (no live Supabase credentials detected)
              </p>
              <button
                type="button"
                onClick={() => {
                  const demoEmail = 'admin@human2.space';
                  localStorage.setItem('human2_admin_session', JSON.stringify({ email: demoEmail, isAdmin: true }));
                  onLoginSuccess(demoEmail);
                }}
                className="text-xs text-[#1F5F78] font-semibold hover:underline cursor-pointer"
              >
                Sign in with Demo Admin credentials →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md mx-auto text-center text-[10px] text-[#5A6663]">
        Human 2.0 Sleep · Authorized personnel only · Protected by sleep_admins policy
      </div>
    </div>
  );
};

export default AdminLogin;
