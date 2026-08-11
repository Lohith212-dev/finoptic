/* Finn's mark — THE CREATURE.  Hand-drawn artwork, and every number in it is final.

   WHAT THIS REPLACES, AND WHY.  Finn used to be two of the parent Finoptic mark's
   four blades, cropped so they read as an opening speech mark — a tint of the
   product's logo, coloured from CSS.  Finn now has its own face: two black square
   eyes with deliberately asymmetric rounded corners, an orange horizontal bar that
   is both arms and the central hub, and two legs splaying from under that hub.
   The assistant is a colleague, not a feature of the logo, and it needed a face to
   be one.  The parent pinwheel mark is untouched — logo.js, the favicon and the
   sidebar lockup all still carry it.

   SOURCE OF TRUTH: planning/design-language/finn/finn-motion-v8.html, the verified
   motion prototype, plus finn-implementation-guide.md beside it.  This constant is
   that prototype's mark markup byte-for-byte inside `<g class="creature">`.

   TWO DEVIATIONS FROM THE PROTOTYPE, BOTH FORCED, BOTH LISTED SO NOBODY "FIXES"
   THEM BACK:
   1. The svg's class is `finn-mark`, not the prototype's `finn`.  `.finn` is
      already this codebase's assistant CONTAINER (index.html, styles.css §12) and
      it carries `position:fixed; inset:0`, so a mark wearing that class would have
      been fixed to the viewport.  styles.css §12's motion block is the prototype's
      CSS with the same rename applied.
   2. No width/height attributes: the three places Finn is drawn size it from CSS,
      which is the one thing the guide says may vary per usage.

   DO NOT TIDY THIS.  Not the path data, not the baked `translate(…)` offsets, not
   the leg rotations (115.023° / 64.977°), not the nested <g> wrappers, and above
   all not through SVGO or any other optimiser.  The motion in styles.css §12
   telescopes each limb about its OWN weld point — 47/65 at y 42.2 for the arms,
   the local origin (0,0) of the rotated frames for the legs — so a collapsed group
   or a flattened rotate() breaks the animation while the resting silhouette still
   looks perfectly correct.  That is the worst kind of regression: invisible until
   somebody asks a question.  The hand-drawn wobble is intentional and load-bearing.

   The fills are LITERAL, not var(--accent), and that is the same rule brands.js
   marks follow: this is artwork carrying its own colour, so it must never be given
   the `.ic` class or recoloured.  Brand orange is #FF5600 — which is also exactly
   the product's default accent — and the eyes are black.

   Always aria-hidden: every place it is drawn either sits beside the word "Finn"
   or lives inside a button that carries its own aria-label. */
const FINN_MARK = '<svg class="finn-mark" viewBox="0 0 112 97" aria-hidden="true"><g class="creature"><g class="limb armL"><path d="M23.0 28.9 L48.2 29.55 L48.2 47.5 L23.2 47.3 Z" transform="translate(-0.10 4)" fill="#FF5600"/></g><path d="M46.5 29.5 L64.0 29.0 L64.0 46.4 L46.5 47.5 Z" transform="translate(-0.10 4)" fill="#FF5600"/><g class="limb armR"><path d="M62.5 29.05 L88.8 27.2 L89.2 45.9 L62.5 46.35 Z" transform="translate(-0.10 4)" fill="#FF5600"/></g><g transform="translate(56 48) rotate(115.023)"><g class="limb legRay"><path d="M1.414 3.028 L-1.414 -3.028 L8.411 -5.624 L40.337 -4.135 C43.319 -3.185 46.255 -2.096 49.191 -1.008 C47.316 4.668 45.394 10.717 43.339 16.243 C39.996 14.993 36.564 13.551 33.312 12.259 Z" fill="#FF5600"/></g></g><g transform="translate(56 48) rotate(64.977)"><g class="limb legRay"><path d="M-1.764 2.598 L0.858 -3.021 L31.778 -12.756 C35.004 -14.229 38.182 -15.836 41.324 -17.128 C43.788 -12.005 46.313 -6.302 48.692 -0.998 C45.998 0.283 43.164 1.388 40.283 2.36 L8.953 5.172 Z" fill="#FF5600"/></g></g><g class="eyeOrb"><g class="ges eyeI"><path d="M34.2566 0H48.0473V9.00225C48.0473 11.6468 45.9034 13.7907 43.2588 13.7907H34.2566V0Z" transform="translate(2.96 4)" fill="black"/></g></g><g class="eyeOrb"><g class="ges eyeI"><path d="M58.0366 0H71.8273V13.7907H62.825C60.1805 13.7907 58.0366 11.6468 58.0366 9.00224V0Z" transform="translate(2.96 4)" fill="black"/></g></g></g></svg>';
