/* Theme namespace - adapted from marimo */
import React from "react";

export const NAMESPACE = "skynet";

export function prefixClass(className: string): string {
  return `${NAMESPACE}-${className}`;
}

/**
 * StyleNamespace component - wraps children with a namespace class
 */
export const StyleNamespace: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement("div", { className: NAMESPACE }, children);
};

