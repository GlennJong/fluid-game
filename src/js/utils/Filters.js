import * as PIXI from 'pixi.js';

export const ThresholdFilter = (r, g, b, range) => {
  const fs = `
  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  void main(void) {
    vec4 color = texture2D(uSampler, vTextureCoord);
    if(color.a > ${range}) {
      gl_FragColor = vec4(${r/255}, ${g/255}, ${b/255}, 1.0);
    } else {
      gl_FragColor =  vec4( 0.0, 0.0, 0.0, 0.0);
    }
  }`;
  const filter = new PIXI.Filter(undefined, fs, {});
  return filter;
}