// todo: need to add this to a utilities folder

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets `window.scrollTo(0, 0)` whenever the route's pathname changes.
 * React Router does not scroll on SPA navigation, so without this, deep
 * scroll positions persist into the next page. Mount once near the Router.
 *
 * Renders nothing.
 *
 * @component
 * @returns {null}
 */
export default function ScrollToTop() {
  const { pathname } = useLocation(); 

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, [pathname]);

  return null;
}