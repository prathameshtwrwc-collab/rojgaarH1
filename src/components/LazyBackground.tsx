import { useEffect, useRef, useState } from 'react';

interface LazyBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string;
  children?: React.ReactNode;
  placeholder?: string;
}

export default function LazyBackground({ image, children, placeholder, className, style, ...props }: LazyBackgroundProps) {
  const [isInView, setIsInView] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (bgRef.current) {
      observer.observe(bgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={bgRef}
      className={className}
      style={{
        ...style,
        backgroundImage: isInView ? `url(${image})` : placeholder ? `url(${placeholder})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
