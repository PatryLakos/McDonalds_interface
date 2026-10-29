import { useEffect, useState } from 'react';

const W = 1080;
const H = 1920;

// Ekran 9:16 projektowany w 1080x1920 i skalowany do okna przeglądarki
export default function Stage({ children, ...rest }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div className="viewport">
      <div className="stage-box" style={{ width: W * scale, height: H * scale }}>
        <div className="stage" style={{ width: W, height: H, transform: `scale(${scale})` }} {...rest}>
          {children}
        </div>
      </div>
    </div>
  );
}
