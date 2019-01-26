export function addTournament(id: string, name: string) {
    return {
        type: 'addTournament' as 'addTournament',
        payload: {
            id,
            name,
        }
    }
}