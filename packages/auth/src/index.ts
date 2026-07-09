import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: false });

  const login = useCallback(async (_email: string, _password: string) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const mockUser: AuthUser = { id: "1", email: _email, name: "User", roles: ["user"] };
      setState({ user: mockUser, token: "mock-token", loading: false });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null, loading: false });
  }, []);

  const hasRole = useCallback(
    (role: string) => state.user?.roles.includes(role) ?? false,
    [state.user],
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
