import { defineCollection, z } from 'astro:content';
import slug from 'slug'

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.date(),
        cover: z.string().optional(),
        excerpt: z.string(),
        published: z.boolean().default(true),
        tags: z.array(z.string()).default([]),
    }),
});

const characters = defineCollection({
    loader: async () => {
        const allCharacters: any[] = [];
        let nextUrl = 'https://rickandmortyapi.com/api/character';
        
        while (nextUrl) {
            const response = await fetch(nextUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch characters');
            }
            const data = await response.json();
            allCharacters.push(...data.results);
            nextUrl = data.info.next;
        }
        
        return allCharacters.map((character: any) => ({
            id: slug(character.name, { lower: true }),
            name: character.name,
            image: character.image,
            species: character.species,
            status: character.status,
            origin: character.origin.name,
            location: character.location.name,

        })
        );
    },
    schema: ({ image }) => z.object({
        id: z.string(),
        name: z.string(),
        image: image(),
        species: z.string(),
        status: z.string(),
        origin: z.string(),
        location: z.string(),
    })
})

export const collections = {
    blog, characters
};