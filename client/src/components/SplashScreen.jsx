import { useState, useRef, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [fading, setFading] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Fallback timer — if video doesn't fire 'ended', force close after 8.5s
    const fallback = setTimeout(() => {
      setFading(true);
    }, 8500);

    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (fading) {
      const t = setTimeout(onFinish, 600); // wait for fade-out animation
      return () => clearTimeout(t);
    }
  }, [fading, onFinish]);

  const handleVideoEnd = () => {
    setFading(true);
  };

  return (
    <div className={`splash-screen ${fading ? 'splash-fade-out' : ''}`}>
      <video
        ref={videoRef}
        className="splash-video"
        src="/Cinematic_title_intro_1080p_202602071142.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
      />
    </div>
  );
}
