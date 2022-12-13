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
      audio.onload = () => {
        console.log(`onload ${audio.src}`);
        toGo--;
        if (toGo <= 0) {
          resolve();
        }
      };
      console.log(`queueing ${urls[i]}`);
      audio.preload = 'auto';
      audio.src = urls[i];
    }
  });
};
