export const preloadAssets = (images: string[]): Promise<void> => {
  return new Promise((resolve) => {
    let toGo = images.length;
    for (let i = 0; i < images.length; i++) {
      const img = new Image();
      img.onload = function () {
        toGo--;
        if (toGo <= 0) {
          resolve();
        }
      };
      img.src = images[i];
    }
  });
};

export const preloadAudio = (urls: string[]): Promise<void> => {
  return new Promise((resolve) => {
    let toGo = urls.length;
    for (let i = 0; i < urls.length; i++) {
      const audio = new Audio();
      audio.oncanplay = () => {
        toGo--;
        if (toGo <= 0) {
          resolve();
        }
      };
      audio.preload = 'auto';
      audio.src = urls[i];
    }
  });
};
