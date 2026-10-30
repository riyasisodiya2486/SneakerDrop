"use client";

import { useEffect } from "react";

/** Adds viewport reveals progressively; content stays visible without JS or with reduced motion. */
export function MotionObserver() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    root.classList.add("motion-ready");
    const targets = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
        targets.delete(entry.target);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    const collect = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node.matches("[data-reveal]") && !node.classList.contains("is-visible")) {
        targets.add(node);
        observer.observe(node);
      }
      node.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((target) => {
        targets.add(target);
        observer.observe(target);
      });
    };

    document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((target) => {
      targets.add(target);
      observer.observe(target);
    });
    const mutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach(collect)));
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      targets.clear();
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
