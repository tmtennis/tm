import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";

const provider = new GoogleAuthProvider();

// Configure the provider for better UX
provider.setCustomParameters({
  prompt: 'select_account'
});

// Optional: Add additional scopes if needed
// provider.addScope('https://www.googleapis.com/auth/userinfo.email');
// provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

const handleGoogleLogin = async () => {
  try {
    // Ensure auth is initialized
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Google login successful:", user.email);
    return { success: true, user };
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign-in was cancelled' };
    } else if (error.code === 'auth/popup-blocked') {
      return { success: false, error: 'Pop-up was blocked. Please allow pop-ups for this site.' };
    } else if (error.code === 'auth/unauthorized-domain') {
      return { success: false, error: 'This domain is not authorized for Google sign-in' };
    }
    
    return { success: false, error: error.message || 'An error occurred during Google sign-in' };
  }
};

export default handleGoogleLogin;
export { provider };
