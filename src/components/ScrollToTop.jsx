/**
 * This component ensures that the page scrolls to the top whenever the route changes.
 * React Router does not automatically reset the scroll position when navigating between pages
 * since it behaves like a Single Page Application (SPA). 
 *
 * Usage:
 * - Import this component in your main App component and place it inside the Router.
 * - It listens for route changes and scrolls the window to the top.
 *
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation(); 

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, [pathname]);

  return null;
}