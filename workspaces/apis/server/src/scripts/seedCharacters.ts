import { CharacterModel } from "@models/character.model"

export const DEFAULT_CHARACTERS = [
    {
        slug: "guerrier",
        characterName: "Le Guerrier",
        description: "Armure lourde, épée à deux mains, lent mais puissant.",
        baseStats: { health: 120, energy: 8, armor: 5 },
        imageUrl: "/character/guerrier"
    },
    {
        slug: "archère",
        characterName: "L'Archère",
        description: "Armure légère, arc, agile et précise.",
        baseStats: { health: 90, energy: 12, armor: 3 },
        imageUrl: "/character/archère"
    },
    {
        slug: "voleur",
        characterName: "Voleur",
        description: "Très rapide, très peu de points de vie. Attaque au corps-à-corps avec des combos rapides.",
        baseStats: { health: 65, energy: 18, armor: 1 },
        imageUrl: "/character/voleur"
    },
    {
        slug: "pyromancien",
        characterName: "Pyromancien",
        description: "Dégâts magiques de zone à mi-distance. Contrôle l'espace avec des flammes grâce à son bâton magique et orbe de feu.",
        baseStats: { health: 75, energy: 16, armor: 2 },
        imageUrl: "/character/pyromancien"
    },
    {
        slug: "barabare",
        characterName: "Barbare",
        description: "Dégâts physiques massifs, plus il prend de coups, plus il tape fort. Assez lent.",
        baseStats: { health: 140, energy: 10, armor: 3 },
        imageUrl: "/character/barabare"
    },
    {
        slug: "paladin",
        characterName: "Paladin",
        description: "Le personnage le plus résistant (Tank absolu). Attaques lentes, peut se créer des boucliers sacrés ou se soigner.",
        baseStats: { health: 150, energy: 8, armor: 8 },
        imageUrl: "/character/paladin"
    },
    {
        slug: "nécromancienne",
        characterName: "Nécromancienne",
        description: "Attaques à distance, draine la vie de l'adversaire ou invoque des esprits pour attaquer.",
        baseStats: { health: 70, energy: 17, armor: 2 },
        imageUrl: "/character/nécromancienne"
    },
    {
        slug: "moine",
        characterName: "Le Moine",
        description: "Mobilité extrême, attaques au poing et au pied. Peut parer facilement les attaques.",
        baseStats: { health: 95, energy: 14, armor: 4 },
        imageUrl: "/character/moine"
    },
    {
        slug: "chevalier",
        characterName: "Le Chevalier Dragon",
        description: "Excellente portée pour un combattant de mêlée (frappe de loin). Attaques sautées rapides.",
        baseStats: { health: 110, energy: 12, armor: 5 },
        imageUrl: "/character/chevalier"
    },
    {
        slug: "artificier",
        characterName: "Artificier",
        description: "Personnage tactique (Zoner). Pose des pièges sur le sol et utilise des gadgets technologiques à distance.",
        baseStats: { health: 85, energy: 14, armor: 4 },
        imageUrl: "/character/artificier"
    },
    {
        slug: "aigle",
        characterName: "L'Aigle Guerrier",
        description: "Combattant féroce et majestueux, alliant la force brute à l'agilité d'un rapace.",
        baseStats: { health: 100, energy: 14, armor: 4 },
        imageUrl: "/character/aigle"
    },
    {
        slug: "scarabée",
        characterName: "Le Cuirassé Scarabée",
        description: "Défense impénétrable. Utilise la force cinétique et son exosquelette gigantesque pour repousser les assauts physiques.",
        baseStats: { health: 160, energy: 6, armor: 9 },
        imageUrl: "/character/scarabée"
    },
    {
        slug: "lame",
        characterName: "La Lame",
        description: "Vitesse d'exécution fulgurante. Spécialisée dans les attaques critiques, les sauts périlleux et l'esquive parfaite.",
        baseStats: { health: 60, energy: 20, armor: 1 },
        imageUrl: "/character/lame"
    },
    {
        slug: "maitre-des-illusions",
        characterName: "L'Oracle Phalène",
        description: "Personnage de soutien/contrôle très puissant. Manipule l'esprit de ses ennemis grâce à des poudres hallucinogènes.",
        baseStats: { health: 75, energy: 18, armor: 2 },
        imageUrl: "/character/maitre-des-illusions"
    },
    {
        slug: "empoisonneur",
        characterName: "Le Seigneur Arachnide",
        description: "Maître du contrôle du terrain et des dégâts sur la durée (DoT). Piège l'ennemi et utilise des toxines mortelles.",
        baseStats: { health: 85, energy: 15, armor: 3 },
        imageUrl: "/character/empoisonneur"
    },
    {
        slug: "gardien-du-temps",
        characterName: "Le Gardien du Temps",
        description: "Guerrier lourd manipulant le flux temporel. Armure intégrant des mécanismes d'horlogerie.",
        baseStats: { health: 125, energy: 12, armor: 6 },
        imageUrl: "/character/gardien-du-temps"
    },
    {
        slug: "tisseuse",
        characterName: "La Tisseuse d'Étoiles",
        description: "Mage d'une immense puissance cosmique, attaquant avec des pluies de météores.",
        baseStats: { health: 65, energy: 20, armor: 2 },
        imageUrl: "/character/tisseuse"
    },
    {
        slug: "moine-d-encre",
        characterName: "Le Maître des Runes",
        description: "Corps couvert de tatouages magiques prenant vie en 3D pour attaquer ou défendre.",
        baseStats: { health: 90, energy: 16, armor: 3 },
        imageUrl: "/character/moine-d-encre"
    }
]

export async function seedCharacters(): Promise<void> {
    const existingCount = await CharacterModel.countDocuments()
    if (existingCount > 0) return

    await CharacterModel.insertMany(DEFAULT_CHARACTERS)
    console.log(`Seeded ${DEFAULT_CHARACTERS.length} characters`)
}