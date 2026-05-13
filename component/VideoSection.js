"use client";
import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export default function VideoSection() {
  const videos = [
    { src: "/videos/Wool.mp4" },
    { src: "/videos/Melton.mp4" },
    { src: "/videos/Cool.mp4" },
    { src: "/videos/Verona.mp4" },
    { src: "/videos/Siboly.mp4" },
    { src: "/videos/Riwayat.mp4" },
  ];

  return (
    <section className="w-full bg-gray-50 py-12 md:py-16">
      <div className="max-w-[1830px] mx-auto px-4">
        <div className="flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold mb-6 px-4 text-center">
          <span className="h-[1.5px] w-10 sm:w-16 md:w-24 bg-gray-300 mr-4"></span>
          <h2 className="text-center text-3xl md:text-4xl font-bold">
            Product Videos
          </h2>
          <span className="h-[1.5px] w-10 sm:w-16 md:w-24 bg-gray-300 ml-4"></span>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {videos.map((video, index) => (
            <VideoCard key={index} src={video.src} />
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoCard({ src }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (playing) videoRef.current.pause();
    else videoRef.current.play();

    setPlaying(!playing);
  };

  return (
    <div className="relative bg-white shadow rounded overflow-hidden group">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Play/Pause Button on Hover */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center"
      >
        {playing ? (
          <Pause className="w-10 h-10 text-white" />
        ) : (
          <Play className="w-10 h-10 text-white" />
        )}
      </button>
    </div>
  );
}
