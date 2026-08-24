// Aspect ratio of every scene plate, read off the files. The phone layout needs
// it: the progressive fade has to be aligned to the PICTURE's edges, not the
// frame's, or the image ends in a hard line partway down a masked layer. Regenerate
// when art is added -- a missing entry falls back to 16:9.

export const ART_RATIO: Record<string, number> = {
  "/images/play/ib/l1-04.webp": 1.3333,
  "/images/play/ib/l1-07.webp": 1.4989,
  "/images/play/ib/l1-12.webp": 1.7766,
  "/images/play/ib/l1-13.webp": 1.4989,
  "/images/play/ib/l2-02.webp": 1.7766,
  "/images/play/ib/l2-07.webp": 1.7766,
  "/images/play/ib/l2-08.webp": 1.7766,
  "/images/play/ib/l2-10.webp": 1.3333,
  "/images/play/ib/l2-18.webp": 1.7766,
  "/images/play/ib/l2-19.webp": 1.7766,
  "/images/play/ib/l2-23.webp": 1.4989,
  "/images/play/ib/l3-06.webp": 1.3333,
  "/images/play/ib/l3-07.webp": 0.9003,
  "/images/play/ib/l3-08.webp": 1.3333,
  "/images/play/ib/l3-14.webp": 1.4989,
  "/images/play/ib/l3-16.webp": 1.4989,
  "/images/play/ib/l3-17.webp": 1.4989,
  "/images/play/ib/l3-19.webp": 1.7766,
  "/images/play/ib/l3-20.webp": 1.7766,
};
