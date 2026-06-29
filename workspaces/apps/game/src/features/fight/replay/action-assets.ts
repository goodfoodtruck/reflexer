const ACTION_ICON_URLS: Record<string, string> = {
    'attaque/Attaque-Cinglant.png':      new URL('../../../assets/images/actions/attaque/Attaque-Cinglant.png', import.meta.url).href,
    'attaque/Boule-feu.png':             new URL('../../../assets/images/actions/attaque/Boule-feu.png', import.meta.url).href,
    'boost/Force-de-la-Terre.png':       new URL('../../../assets/images/actions/boost/Force-de-la-Terre.png', import.meta.url).href,
    'boost/Bénédiction-du-magicien.png': new URL('../../../assets/images/actions/boost/Bénédiction-du-magicien.png', import.meta.url).href,
    'soin/Soins palliatifs.png':         new URL('../../../assets/images/actions/soin/Soins palliatifs.png', import.meta.url).href,
    'soin/Renforts.png':                 new URL('../../../assets/images/actions/soin/Renforts.png', import.meta.url).href,
    'mouvement/Flee.png':                new URL('../../../assets/images/actions/mouvement/Flee.png', import.meta.url).href,
    'mouvement/Charge.png':              new URL('../../../assets/images/actions/mouvement/Charge.png', import.meta.url).href,
    'mouvement/Teleport.png':            new URL('../../../assets/images/actions/mouvement/Teleport.png', import.meta.url).href,
    'défense/Barricade.png':             new URL('../../../assets/images/actions/défense/Barricade.png', import.meta.url).href,
}

export function resolveActionIconUrl(logicalPath: string): string | null {
    return ACTION_ICON_URLS[logicalPath] ?? null
}
