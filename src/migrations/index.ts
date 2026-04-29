import * as migration_20260429_184126_hover_highlights_array_dbname from './20260429_184126_hover_highlights_array_dbname';
import * as migration_20260429_192840 from './20260429_192840';

export const migrations = [
  {
    up: migration_20260429_184126_hover_highlights_array_dbname.up,
    down: migration_20260429_184126_hover_highlights_array_dbname.down,
    name: '20260429_184126_hover_highlights_array_dbname',
  },
  {
    up: migration_20260429_192840.up,
    down: migration_20260429_192840.down,
    name: '20260429_192840',
  },
];
