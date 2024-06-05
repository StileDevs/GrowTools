"use client";

import { WritableAtom, atom, useAtom } from "jotai";

export function atomToggle(initialValue?: boolean) {
  const anAtom = atom(initialValue, (get, set, nextValue?: boolean) => {
    const update = nextValue ?? !get(anAtom);
    set(anAtom, update);
  });

  return anAtom as WritableAtom<boolean, [boolean?], void>;
}
