import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {calculateGames} from "./components/round";
import {Game} from "./data/data";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});


describe('round calculation', () => {
    const makePlayers = (num: number) => Array.from(Array(num)).map((v,i) => `Player ${i}`)
    const fixture = (playerCount: number, setup: [number, number][]) => {
        const players = makePlayers(playerCount)
        const games = calculateGames(players, 'aa')

        expect(games.length).toEqual(setup.length)
        setup.forEach((expectedSizes, index) => {
            const game = games[index]
            const sizes = [game.bluePlayers.length, game.redPlayers.length].sort()
            expect(sizes).toEqual(expectedSizes.slice().sort())
        })
    }

    it('should divide 4 players in 1 game / 2 players', () => {
        fixture(4, [[2, 2]])
    })
    it('should divide 5 players in 1 game / 2 and 3 players', () => {
        fixture(5, [[3, 2]])
    })
    it('should divide 6 players in 1 game / 3 players', () => {
        fixture(6, [[3, 3]])
    })
    it('should divide 7 players in 1 game / 4 and 3 players', () => {
        fixture(7, [[4, 3]])
    })
    it('should divide 8 players in 1 game / 4 players', () => {
        fixture(8, [[4, 4]])
    })
    it('should divide 9 players in 1 game / 4 and 5 players', () => {
        fixture(9, [[5, 4]])
    })
    it('should divide 10 players in 2 games / 2x2 and 2x3', () => {
        fixture(10, [[2, 2], [3, 3]])
    })
    it('should divide 11 players in 2 games / 2x2 and 3/4', () => {
        fixture(11, [[2, 2], [3, 4]])
    })
    it('should divide 12 players in 2 games / 2x2 and 2x4', () => {
        fixture(12, [[4, 4], [2, 2]])
    })
    it('should divide 13 players in 2 games / 2x2 and 2x4', () => {
        fixture(13, [[4, 4], [2, 3]])
    })
    it('should divide 14 players in 2 games / 2x2 and 2x4', () => {
        fixture(14, [[4, 4], [3, 3]])
    })
    it('should divide 15 players in 2 games / 2x2 and 2x4', () => {
        fixture(15, [[4, 4], [4, 3]])
    })
    it('should divide 16 players in 2 games / 2x2 and 2x4', () => {
        fixture(16, [[4, 4], [4, 4]])
    })
})