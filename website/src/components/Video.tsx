import { Icon } from "@iconify/react";
import { useRef, useState } from "react";

export default function Video({
  src,
  className,
}: {
  src: string;
  className?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayIcon, setShowPlayIcon] = useState(true);
  const [isClickedPlaying, setIsClickedPlaying] = useState(false);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setShowPlayIcon(false);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset video to the beginning
      setShowPlayIcon(true);
    }
  };
  const handleClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play();
        setShowPlayIcon(false);
        setIsClickedPlaying(true); // Set state to indicate click-play
      } else {
        videoRef.current.pause();
        setShowPlayIcon(true);
        setIsClickedPlaying(false); // Set state to indicate not click-playing
      }
    }
  };

  return (
    <div
      className={"video-container " + className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        muted
        loop={true}
        preload="auto"
        height={"auto"}
        controls={false}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className={`play-icon-overlay ${showPlayIcon ? "" : "hidden"}`}>
        <Icon icon={"ri:play-large-fill"} width={20} color={"#b2b2b2"} />
      </div>
    </div>
  );
}
