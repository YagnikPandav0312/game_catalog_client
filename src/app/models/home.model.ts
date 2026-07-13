export interface Provider {
    id: number;
    name: string;
    logo: string;
    slug: string;
}

export interface Game {
    id: number;
    title: string;
    provider: string;
    image: string;
    category: string;
    slug: string;
    isPopular?: boolean;
    isNew?: boolean;
}

export interface Promotion {
    id: number;
    title: string;
    description: string;
    image: string;
    badge: string;
    color: string;
}