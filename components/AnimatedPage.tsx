"use client";

import React, { useEffect, useState, useRef } from "react";

// ============================================================
// AnimatedPage — Wrapper untuk entrance animation halaman
// ============================================================
interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className = "" }: AnimatedPageProps) {
  return (
    <div className={`animate-fadeInUp ${className}`}>
      {children}
    </div>
  );
}

// ============================================================
// AnimatedItem — Wrapper untuk staggered children animation
// ============================================================
interface AnimatedItemProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
  animation?: "fadeInUp" | "scaleIn" | "slideInLeft" | "slideInRight";
  as?: React.ElementType;
  style?: React.CSSProperties;
  staggerDelay?: number;
}

export function AnimatedItem({
  children,
  index = 0,
  className = "",
  animation = "fadeInUp",
  as: Component = "div",
  style = {},
  staggerDelay = 80,
}: AnimatedItemProps) {
  const animationClass = {
    fadeInUp: "animate-fadeInUp",
    scaleIn: "animate-scaleIn",
    slideInLeft: "animate-slideInLeft",
    slideInRight: "animate-slideInRight",
  }[animation];

  return (
    <Component
      className={`${animationClass} ${className}`}
      style={{ animationDelay: `${index * staggerDelay}ms`, animationFillMode: "both", ...style }}
    >
      {children}
    </Component>
  );
}

// ============================================================
// CountUp — Animasi angka dari 0 ke target value
// ============================================================
interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
  className?: string;
}

export function CountUp({
  end,
  duration = 1200,
  prefix = "",
  suffix = "",
  formatter,
  className = "",
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    countRef.current = 0;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(eased * end);

      if (currentValue !== countRef.current) {
        countRef.current = currentValue;
        setCount(currentValue);
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration]);

  const displayValue = formatter ? formatter(count) : count.toString();

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

// ============================================================
// StaggeredList — Container yang otomatis stagger children
// ============================================================
interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  animation?: "fadeInUp" | "scaleIn" | "slideInLeft" | "slideInRight";
}

export function StaggeredList({
  children,
  className = "",
  staggerDelay = 80,
  animation = "fadeInUp",
}: StaggeredListProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <AnimatedItem key={index} index={index} animation={animation}>
            {child}
          </AnimatedItem>
        );
      })}
    </div>
  );
}
