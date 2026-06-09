"use client";

import { useSyncExternalStore, type MouseEvent, type ReactNode } from "react";

type ContactAnchorProps = {
  href: string;
  nativeApp?: boolean;
  appUrl?: string;
  children: ReactNode;
};

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getTouchPrimary() {
  return window.matchMedia("(pointer: coarse)").matches;
}

function useTouchPrimary() {
  return useSyncExternalStore(subscribe, getTouchPrimary, () => false);
}

export function ContactAnchor({ href, nativeApp, appUrl, children }: ContactAnchorProps) {
  const touchPrimary = useTouchPrimary();
  const openInSameTab = nativeApp && touchPrimary;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!nativeApp || !touchPrimary || !appUrl) return;

    event.preventDefault();
    window.location.assign(appUrl);
    window.setTimeout(() => window.location.assign(href), 600);
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      {...(openInSameTab ? {} : { target: "_blank" })}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
