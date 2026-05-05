import { NavLink } from "react-router-dom";
import { auth } from "../lib/firebase";
import {  signOut } from "firebase/auth";
import { useAuthUser } from "../lib/auth";

export default function Navbar() {

  const user = useAuthUser();
  
  function handleLogout() {
    signOut(auth);
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-brand">Musāʿid</div>
        

        <div className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/books">Books</NavLink>
         <NavLink to="/checker">Sentence Checker</NavLink>
          {/* alternates between user and guest ui based on login */}
          {user ? (
            <>
              <NavLink to="/account">Account</NavLink>
              <button onClick={handleLogout} className="btn">Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/signup">Sign up</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}