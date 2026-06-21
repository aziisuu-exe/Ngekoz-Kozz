"use client";

import { useEffect, useRef } from "react";
import { incrementKosView } from "../actions"; 

export function ViewCounter({ idKos }: { idKos: number }) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (!hasIncremented.current) {
      incrementKosView(idKos);
      hasIncremented.current = true;
    }
  }, [idKos]);

  return null; 
}