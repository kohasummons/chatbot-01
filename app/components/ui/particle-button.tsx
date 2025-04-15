"use client" 

import * as React from "react"
import { useState, useRef } from "react";
import { Button, type ButtonProps } from "./buttons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MousePointerClick } from "lucide-react";

interface ParticleButtonProps extends ButtonProps {
    onSuccess?: () => void;
    successDuration?: number;
}

function SuccessParticles({
    buttonRef,
}: {
    buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return (
        <AnimatePresence>
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="fixed w-1 h-1 bg-black dark:bg-white rounded-full"
                    style={{ left: centerX, top: centerY }}
                    initial={{
                        scale: 0,
                        x: 0,
                        y: 0,
                    }}
                    animate={{
                        scale: [0, 1, 0],
                        x: [0, (i % 2 ? 1 : -1) * (Math.random() * 50 + 20)],
                        y: [0, -Math.random() * 50 - 20],
                    }}
                    transition={{
                        duration: 0.6,
                        delay: i * 0.1,
                        ease: "easeOut",
                    }}
                />
            ))}
        </AnimatePresence>
    );
}

const ParticleButton = React.forwardRef<HTMLButtonElement, ParticleButtonProps>(
    ({ children, onClick, onSuccess, successDuration = 1000, className, ...props }, ref) => {
        const [showParticles, setShowParticles] = useState(false);
        const internalRef = useRef<HTMLButtonElement>(null);
        
        // Use the provided ref if available, otherwise use our internal ref
        const finalRef = (ref || internalRef) as React.RefObject<HTMLButtonElement>;

        const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
            setShowParticles(true);
            
            if (onClick) onClick(e);
            if (onSuccess) onSuccess();

            setTimeout(() => {
                setShowParticles(false);
            }, successDuration);
        };

        return (
            <>
                {showParticles && <SuccessParticles buttonRef={finalRef} />}
                <Button
                    ref={ref || internalRef}
                    onClick={handleClick}
                    className={cn(
                        "relative",
                        showParticles && "scale-95",
                        "transition-transform duration-100",
                        className
                    )}
                    {...props}
                >
                    {children}
                    <MousePointerClick className="h-4 w-4 ml-2" />
                </Button>
            </>
        );
    }
);

ParticleButton.displayName = "ParticleButton";

export { ParticleButton } 