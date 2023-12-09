import { getSession } from '../hooks.js';

export async function load({ cookies }) {
    return {
        user: await getSession(cookies)
    };
}