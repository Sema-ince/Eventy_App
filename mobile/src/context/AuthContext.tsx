import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import { ASYNC_STORAGE_KEYS } from '../constants/config';
import type { User } from '../types';

// ─── State Types ──────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOADING' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_INITIAL'; payload: { user: User; token: string } | null };

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: {
    name?: string;
    email?: string;
    password?: string;
    bio?: string;
    avatar?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ─── Reducer ──────────────────────────────────────────────────────
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'SET_INITIAL':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: !!action.payload,
        user: action.payload?.user ?? null,
        token: action.payload?.token ?? null,
      };
    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Auto-login: restore session & validate token with backend (/auth/me)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [tokenItem, userJsonItem] = await AsyncStorage.multiGet([
          ASYNC_STORAGE_KEYS.AUTH_TOKEN,
          ASYNC_STORAGE_KEYS.USER_DATA,
        ]);

        const storedToken = tokenItem[1];
        const storedUser = userJsonItem[1];

        if (!storedToken) {
          dispatch({ type: 'SET_INITIAL', payload: null });
          return;
        }

        // Verify token against backend API
        try {
          const freshUser = await authService.getMe();
          // Update local cache with fresh user profile
          await AsyncStorage.setItem(
            ASYNC_STORAGE_KEYS.USER_DATA,
            JSON.stringify(freshUser)
          );
          dispatch({
            type: 'SET_INITIAL',
            payload: { user: freshUser, token: storedToken },
          });
        } catch (apiError: any) {
          const status = apiError?.response?.status;
          const msg = String(apiError?.message || '').toLowerCase();
          const isTokenInvalid =
            status === 401 ||
            status === 403 ||
            msg.includes('401') ||
            msg.includes('access denied') ||
            msg.includes('invalid') ||
            msg.includes('expired');

          if (isTokenInvalid) {
            // Token is expired/invalid — clear session and redirect to Login
            await AsyncStorage.multiRemove([
              ASYNC_STORAGE_KEYS.AUTH_TOKEN,
              ASYNC_STORAGE_KEYS.USER_DATA,
            ]);
            dispatch({ type: 'SET_INITIAL', payload: null });
          } else if (storedUser) {
            // Transient network error: fallback gracefully to cached session
            try {
              const cachedUser = JSON.parse(storedUser) as User;
              dispatch({
                type: 'SET_INITIAL',
                payload: { user: cachedUser, token: storedToken },
              });
            } catch {
              dispatch({ type: 'SET_INITIAL', payload: null });
            }
          } else {
            dispatch({ type: 'SET_INITIAL', payload: null });
          }
        }
      } catch {
        dispatch({ type: 'SET_INITIAL', payload: null });
      }
    };

    restoreSession();
  }, []);

  const saveSession = async (user: User, token: string) => {
    await AsyncStorage.multiSet([
      [ASYNC_STORAGE_KEYS.AUTH_TOKEN, token],
      [ASYNC_STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
    ]);
  };

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'LOADING' });
    const { user, token } = await authService.login(email, password);
    await saveSession(user, token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    dispatch({ type: 'LOADING' });
    const { user, token } = await authService.register(name, email, password);
    await saveSession(user, token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([
      ASYNC_STORAGE_KEYS.AUTH_TOKEN,
      ASYNC_STORAGE_KEYS.USER_DATA,
    ]);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback(
    async (data: {
      name?: string;
      email?: string;
      password?: string;
      bio?: string;
      avatar?: string;
    }) => {
      const updatedUser = await authService.updateMe(data);
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    },
    []
  );

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getMe();
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      dispatch({ type: 'UPDATE_USER', payload: user });
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
