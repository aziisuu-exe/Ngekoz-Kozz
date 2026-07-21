"use client";

import { useState } from "react";

interface UserAvatarProps {
  src: string | null;
  name: string;
}

export function UserAvatar({ src, name }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : "P";

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImageError(true)}
        className="h-8 w-8 rounded-full object-cover border border-purple-100 shrink-0 shadow-2xs"
      />
    );
  }

  return (
    <div className="h-8 w-8 rounded-full bg-purple-50 text-purple-600 font-black flex items-center justify-center text-xs border border-purple-100 shrink-0">
      {initial}
    </div>
  );
}