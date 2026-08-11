/* Scenario registry.
   Loaded BEFORE the scenario-*.js files, which each call FINOPTIC.scenario()
   exactly once with a pure-JSON payload.  See SCHEMA.md for the shape, and for
   why the datasets are .js wrappers rather than plain .json files (browsers
   block fetch() of a local file from a file:// origin, so a double-clickable
   mock-up cannot read its own .json). */
const FINOPTIC = {
  list: [],
  scenario(payload){ this.list.push(payload); },
  /* Used by the "Load JSON…" picker, which reads a real .json file through
     FileReader — the one route that does work from file://.  Replaces any
     previously loaded copy of the same id so re-importing is idempotent. */
  adopt(payload){
    const i = this.list.findIndex(s => s.id === payload.id);
    if(i >= 0) this.list[i] = payload; else this.list.push(payload);
    return payload.id;
  }
};
