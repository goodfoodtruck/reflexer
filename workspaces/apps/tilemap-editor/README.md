# @apps/tilemap-editor

Éditeur de tilemap autonome : on charge une image ou un GIF, on règle la grille,
on peint des cases `FLOOR` / `WALL` / `HOLE`, puis on exporte une matrice
`grid[row][col]` en JSON.

Tout tourne dans le navigateur.

## Intégrer dans le monorepo pnpm

Pose ce dossier dans tes apps (ex. `apps/tilemap-editor/`), puis :

## Utiliser le composant ailleurs

Le cœur est un seul composant sans dépendance externe :

```jsx
import TilemapEditor from "@apps/tilemap-editor/src/TilemapEditor.jsx";
import "@apps/tilemap-editor/src/styles.css";

export default function Page() {
  return <TilemapEditor initialCols={14} initialRows={14} onExport={(grid) => console.log(grid)} />;
}
```

### Props

| Prop          | Type                         | Défaut | Rôle                                            |
|---------------|------------------------------|--------|-------------------------------------------------|
| `initialCols` | `number`                     | `14`   | Colonnes au démarrage                           |
| `initialRows` | `number`                     | `14`   | Lignes au démarrage                             |
| `onExport`    | `(grid: string[][]) => void` | —      | Appelé avec la matrice à l'ouverture de l'export |

La matrice exportée a la forme `grid[row][col]`, chaque cellule valant
`"FLOOR"`, `"WALL"` ou `"HOLE"`.

## Raccourcis

`1` FLOOR · `2` WALL · `3` HOLE — puis clic ou glissé pour peindre.