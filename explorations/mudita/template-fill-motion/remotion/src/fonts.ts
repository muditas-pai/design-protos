import {continueRender, delayRender, staticFile} from 'remotion';

// Familjen Grotesk is the slide's display face; load it before the first frame renders.
const handle = delayRender('Loading Familjen Grotesk');

const face = new FontFace(
  'Familjen Grotesk',
  `url(${staticFile('fonts/FamiljenGrotesk-Regular.woff2')}) format('woff2')`
);

face
  .load()
  .then(() => {
    document.fonts.add(face);
    continueRender(handle);
  })
  .catch(() => continueRender(handle));

export {};
