"use client";

import { useEffect, useRef, useState } from "react";
import { learnApi } from "@/lib/api";

interface VideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  courseSlug: string;
  initialWatchTime?: number;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function VideoPlayer({ videoUrl, lessonId, courseSlug, initialWatchTime = 0 }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isReady, setIsReady] = useState(false);

  const youtubeId = getYouTubeId(videoUrl);

  // Lưu thời gian xem mỗi 10 giây (chỉ cho video tự host)
  useEffect(() => {
    if (youtubeId) return;
    saveTimerRef.current = setInterval(() => {
      const current = Math.floor(videoRef.current?.currentTime ?? 0);
      if (current > 0) {
        learnApi.updateWatchTime(lessonId, current).catch(() => {});
      }
    }, 10000);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [lessonId, youtubeId]);

  // Khôi phục vị trí xem
  useEffect(() => {
    if (!youtubeId && videoRef.current && initialWatchTime > 0) {
      const onLoaded = () => {
        videoRef.current!.currentTime = initialWatchTime;
        setIsReady(true);
      };
      videoRef.current.addEventListener("loadedmetadata", onLoaded);
      return () => videoRef.current?.removeEventListener("loadedmetadata", onLoaded);
    }
  }, [initialWatchTime, youtubeId]);

  if (youtubeId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title="Video bài học"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full h-full"
        onLoadedMetadata={() => setIsReady(true)}
        onEnded={() => learnApi.updateWatchTime(lessonId, Math.floor(videoRef.current?.duration ?? 0)).catch(() => {})}
      >
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    </div>
  );
}
