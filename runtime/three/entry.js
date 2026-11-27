// The 3D stage of connect-ai-three (MIT, CONNECT AI LAB, lessons 6-7), used by the three/* blocks of a deck.
// `build` bundles this file with three.js from node_modules into assets/vendor/cs-three.js (a classic script,
// so the deck still opens by double click). createStage(spec).render(t) is a pure function of time: the same
// clock contract as every other block.
import * as THREE from 'three';
import {createStage, normalizeSpec, names, LOOKS} from './runtime/index.js';
import './plugins/gltf.js';
import './plugins/fonts.js';
import './plugins/text3d.js';
import './plugins/brand.js';

window.CSThree = {THREE, createStage, normalizeSpec, names, LOOKS};
