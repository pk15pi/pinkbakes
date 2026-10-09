import { useEffect, useState } from "react";
import { POLICIES, policyFromPath } from "../policies";

export default function usePolicyRoute(setChatOpen) {
  const [policySlug, setPolicySlug] = useState(() => policyFromPath(window.location.pathname)?.slug || null);

  useEffect(() => {
    const syncPolicy = () => {
      setPolicySlug(policyFromPath(window.location.pathname)?.slug || null);
    };
    window.addEventListener("popstate", syncPolicy);
    return () => window.removeEventListener("popstate", syncPolicy);
  }, []);

  function openPolicy(slug) {
    const policy = POLICIES[slug];
    if (!policy) return;
    setChatOpen(false);
    setPolicySlug(slug);
    try {
      if ((policyFromPath(window.location.pathname)?.slug || null) !== slug) {
        window.history.pushState({ policy: slug }, "", policy.path);
      }
    } catch (_) { /* ignore */ }
  }

  function closePolicy() {
    setPolicySlug(null);
    try {
      if (policyFromPath(window.location.pathname)) {
        window.history.pushState({}, "", "/");
      }
    } catch (_) { /* ignore */ }
  }

  return { policySlug, openPolicy, closePolicy };
}
