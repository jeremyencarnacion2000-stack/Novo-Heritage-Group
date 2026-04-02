"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useIntelligentTracking } from "@/hooks/use-intelligent-tracking";

export function TrackingInitiator() {
  const { data: session } = useSession();
  const [userId, setUserId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const existingGuestId = localStorage.getItem('guest_id');
    const currentId = session?.user?.email || existingGuestId;
    
    if (!currentId) {
      const newGuestId = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guest_id', newGuestId);
      setUserId(newGuestId);
    } else {
      setUserId(currentId);
    }
  }, [session]);

  useIntelligentTracking(userId);

  return null;
}
