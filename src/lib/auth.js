import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
  } from "firebase/auth";
  import { auth } from "./firebase";

import { useEffect, useState } from "react";
  
  export async function signUpUser({ name, email, password }) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
    // FB doesnt store name by default
    await updateProfile(userCredential.user, {
      displayName: name,
    });
  
    return userCredential.user;
  }
  
  export async function logInUser({ email, password }) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }


// always know whos logged in
export function useAuthUser() {
  const [user, setUser] = useState(undefined); // undefined still checking and null is not logged in

  //runs whenever user logs in and out
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  return user;
}