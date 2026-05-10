"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { X, Maximize, Minus, MessageSquare } from 'lucide-react';

interface HeyGenIframeProps {
  url?: string;
  title?: string;
}

export function HeyGenIframe({ 
  url = "https://labs.heygen.com/guest/interactive-avatar/demo", 
  title = "Novo Heritage Interactive Avatar" 
}: HeyGenIframeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-400 text-black shadow-2xl shadow-yellow-500/20"
          >
            <MessageSquare className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed z-50 overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out ${
              isExpanded 
                ? 'inset-4 md:inset-10' 
                : 'bottom-6 right-6 h-[600px] w-[350px] md:h-[700px] md:w-[400px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-black/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
                <span className="text-sm font-medium text-white/90">{title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {isExpanded ? <Minus className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Iframe Container */}
            <div className="relative h-[calc(100%-49px)] w-full bg-zinc-950">
              <iframe
                src={url}
                className="h-full w-full border-none"
                allow="camera; microphone; fullscreen; display-capture"
                title={title}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
