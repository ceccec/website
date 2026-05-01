import * as migration_20260429_184126_hover_highlights_array_dbname from './20260429_184126_hover_highlights_array_dbname';
import * as migration_20260429_192840 from './20260429_192840';

export const migrations = [
  {
    name: '20260429_184126_hover_highlights_array_dbname',
    down: migration_20260429_184126_hover_highlights_array_dbname.down,
    up: migration_20260429_184126_hover_highlights_array_dbname.up,
  },
  {
    name: '20260429_192840',
    down: migration_20260429_192840.down,
    up: migration_20260429_192840.up,
  },
];
