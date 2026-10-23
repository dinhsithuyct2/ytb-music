import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Standard Google Auth Provider - no sensitive YouTube scopes requested
// to prevent the "Google unverified app" blocker for testers
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account',
});

const TOKEN_STORAGE_KEY = 'yt_music_google_access_token';

// Memory and sessionStorage cache for access token
let cachedAccessToken: string | null = (() => {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
})();

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {}
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      setAccessToken(null);
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;
    if (token) {
      setAccessToken(token);
    }

    return { user: result.user, accessToken: token };
  } catch (error: any) {
    if (
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      console.log('Người dùng đã đóng popup đăng nhập Google.');
      return null;
    }
    console.error('Lỗi đăng nhập Google:', error);
    throw error;
  }
};

// Request elevated YouTube permissions to read user playlists & liked videos
export const requestYouTubeOAuthToken = async (): Promise<string | null> => {
  const ytProvider = new GoogleAuthProvider();
  ytProvider.addScope('https://www.googleapis.com/auth/youtube.readonly');
  ytProvider.setCustomParameters({
    prompt: 'consent',
  });

  try {
    const result = await signInWithPopup(auth, ytProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;
    if (token) {
      setAccessToken(token);
    }
    return token;
  } catch (error: any) {
    if (
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      return null;
    }
    console.error('Lỗi yêu cầu quyền YouTube OAuth:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  setAccessToken(null);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

