// import React, { createContext, useContext, useState, useCallback } from "react";

// // ===============================
// // COGNITO CONFIG (same as auth.js)
// // ===============================
// const USER_POOL_ID = "ap-south-1_jQlQVcwrO";
// const CLIENT_ID = "67qs1gbi96i4caeq78m9bit058";
// const REGION = "ap-south-1";

// async function cognitoRequest(action: string, data: any) {
//   const url = `https://cognito-idp.${REGION}.amazonaws.com/`;

//   const headers = {
//     "Content-Type": "application/x-amz-json-1.1",
//     "X-Amz-Target": action,
//   };

//   const res = await fetch(url, {
//     method: "POST",
//     headers,
//     body: JSON.stringify(data),
//   });

//   return res.json();
// }

// // SIGNUP
// async function awsSignup(name: string, email: string, password: string) {
//   return await cognitoRequest("AWSCognitoIdentityProviderService.SignUp", {
//     ClientId: CLIENT_ID,
//     Username: email,
//     Password: password,
//   });
// }

// // VERIFY EMAIL
// async function awsVerifyEmail(email: string, code: string) {
//   return await cognitoRequest(
//     "AWSCognitoIdentityProviderService.ConfirmSignUp",
//     {
//       ClientId: CLIENT_ID,
//       Username: email,
//       ConfirmationCode: code,
//     }
//   );
// }

// // LOGIN
// async function awsLogin(email: string, password: string) {
//   return await cognitoRequest(
//     "AWSCognitoIdentityProviderService.InitiateAuth",
//     {
//       AuthFlow: "USER_PASSWORD_AUTH",
//       ClientId: CLIENT_ID,
//       AuthParameters: {
//         USERNAME: email,
//         PASSWORD: password,
//       },
//     }
//   );
// }

// // SAVE TOKENS — same as old JS
// function saveTokens(authResult: any) {
//   const id = authResult?.AuthenticationResult?.IdToken;
//   const access = authResult?.AuthenticationResult?.AccessToken;

//   if (id) localStorage.setItem("id_token", id);
//   if (access) localStorage.setItem("access_token", access);
// }

// // ===============================
// // AUTH CONTEXT
// // ===============================
// interface AuthContextType {
//   signup: (name: string, email: string, password: string) => Promise<boolean>;
//   verifyEmail: (email: string, code: string) => Promise<boolean>;
//   login: (email: string, password: string) => Promise<boolean>;
//   logout: () => void;
//   isLoading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [isLoading, setIsLoading] = useState(false);

//   // SIGNUP
//   const signup = useCallback(async (name, email, password) => {
//     setIsLoading(true);
//     try {
//       const result = await awsSignup(name, email, password);
//       return !result?.errorType;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // VERIFY EMAIL
//   const verifyEmail = useCallback(async (email, code) => {
//     setIsLoading(true);
//     try {
//       const result = await awsVerifyEmail(email, code);
//       return !result?.errorType;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // LOGIN
//   const login = useCallback(async (email, password) => {
//     setIsLoading(true);

//     try {
//       const result = await awsLogin(email, password);

//       if (result?.AuthenticationResult) {
//         saveTokens(result); // saves id_token, access_token
//         return true;
//       }

//       return false;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const logout = useCallback(() => {
//     localStorage.removeItem("id_token");
//     localStorage.removeItem("access_token");
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{ signup, verifyEmail, login, logout, isLoading }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

// ===============================
// COGNITO CONFIG
// ===============================
const USER_POOL_ID = "ap-south-1_jQlQVcwrO";
const CLIENT_ID = "67qs1gbi96i4caeq78m9bit058";
const REGION = "ap-south-1";

// ===============================
// HELPER — CALL COGNITO API
// ===============================
async function cognitoRequest(action: string, data: any) {
  const url = `https://cognito-idp.${REGION}.amazonaws.com/`;

  const headers = {
    "Content-Type": "application/x-amz-json-1.1",
    "X-Amz-Target": action,
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  return res.json();
}

// ===============================
// AUTH REQUEST HELPERS
// ===============================
async function realSignup(email: string, password: string) {
  return cognitoRequest("AWSCognitoIdentityProviderService.SignUp", {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
  });
}

async function realVerify(email: string, code: string) {
  return cognitoRequest("AWSCognitoIdentityProviderService.ConfirmSignUp", {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  });
}

async function realLogin(email: string, password: string) {
  return cognitoRequest("AWSCognitoIdentityProviderService.InitiateAuth", {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });
}

// ===============================
// TOKEN UTILITIES
// ===============================
function saveTokens(auth: any) {
  const id = auth?.AuthenticationResult?.IdToken;
  const access = auth?.AuthenticationResult?.AccessToken;

  if (id) localStorage.setItem("id_token", id);
  if (access) localStorage.setItem("access_token", access);
}

function parseJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    return Date.now() > exp;
  } catch {
    return true;
  }
}

// ===============================
// CONTEXT DEFINITION
// ===============================
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===============================
// PROVIDER
// ===============================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ FIX: Start as loading until check finishes

  // ✅ FIX: Restore session on app load (without wiping tokens)
  useEffect(() => {
    const restoreSession = () => {
      const idToken = localStorage.getItem("id_token");
      const email = localStorage.getItem("email");

      if (!idToken || !email) {
        setIsLoading(false);
        return;
      }

      if (isTokenExpired(idToken)) {
        console.log("Token expired, clearing...");
        localStorage.removeItem("id_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("email");
        setUser(null);
        setIsLoading(false);
        return;
      }

      const profile = parseJwt(idToken);
      if (profile?.email) {
        setUser({
          id: profile.sub,
          email: profile.email,
          name: profile.email.split("@")[0],
        });
        console.log("✅ Session restored for:", profile.email);
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await realLogin(email, password);

      if (result.AuthenticationResult) {
        saveTokens(result);
        const idToken = result.AuthenticationResult.IdToken;
        const profile = parseJwt(idToken);

        if (profile?.email) localStorage.setItem("email", profile.email);

        setUser({
          id: profile.sub,
          email: profile.email,
          name: profile.email.split("@")[0],
        });

        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // SIGNUP
  const signup = useCallback(async (name, email, password) => {
    setIsLoading(true);
    try {
      const res = await realSignup(email, password);
      return !res.errorType;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // VERIFY EMAIL
  const verifyEmail = useCallback(async (email, code) => {
    setIsLoading(true);
    try {
      const res = await realVerify(email, code);
      return !res.errorType;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem("id_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("email");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        verifyEmail,
        logout,
      }}
    >
      {isLoading ? (
        // ✅ FIX: prevent app from thinking user is logged out while checking
        <div className="flex items-center justify-center h-screen">
          <p>Restoring session...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
