import { describe, expect, it } from 'vitest';
import { ACCUSE, choices } from './career';
import { Engine } from './engine';
import { newGame } from './state';

const POST = 'post_cerdans_inquirer';
const inquirer = () => {
  const state = newGame(11, 0);
  state.place = 'marre_palace';
  state.home = 'marre_palace';
  const e = new Engine(state);
  e.handle({ type: 'takePost', post: POST }, 0);
  e.run(2);
  e.handle({ type: 'takeCase', case: 'case_cerdans_short_measure' }, 0);
  return e;
};

describe('the Inquirer of the Cerdans', () => {
  it('is a post on the Piazza with four ranks and a case that ends in an accusation', () => {
    const e = inquirer();
    const post = e.world.posts.get(POST);
    expect(post?.place).toBe('marre_palace');
    expect(post?.ranks).toEqual(['Informer', 'Constable', 'Inquirer', "Capo's Deputy"]);
    expect(post?.work.at(-1)?.accuse).toBe(true);
    expect(post?.work.filter((s) => s.accuse)).toHaveLength(1);
  });

  it('makes the accusation surer with every clue', () => {
    const e = inquirer();
    const venture = e.state.venture;
    if (!venture) throw new Error('no case');
    venture.step = 4;
    venture.quality = 0;
    const blind = choices(e.state, e.world)[0]?.chance ?? 0;
    venture.quality = 4;
    const proven = choices(e.state, e.world)[0]?.chance ?? 0;
    expect(proven).toBeGreaterThan(blind);
    // With no clues it is harder than any other step of the case.
    venture.quality = 0;
    venture.step = 0;
    expect(choices(e.state, e.world)[0]?.chance ?? 0).toBeGreaterThan(blind);
  });

  it('costs standing and spoils the case when the accusation is wrong', () => {
    let wrong = 0;
    let right = 0;
    for (let seed = 1; seed <= 40 && (wrong === 0 || right === 0); seed++) {
      const e = inquirer();
      e.state.seed = seed;
      const held = e.state.post;
      const venture = e.state.venture;
      if (!held || !venture) throw new Error('no case');
      held.standing = 20;
      venture.step = 4;
      venture.quality = 1;
      e.state.hours = 24 * 7 + 4;
      e.handle({ type: 'step', approach: 'lay_out_the_proof' }, 0);
      while (e.state.venture) e.tick();
      const work = e.state.works.at(-1);
      if ((work?.quality ?? 0) < 0) {
        wrong += 1;
        expect(held.standing).toBe(20 - ACCUSE.wrongStanding);
      } else {
        right += 1;
        expect(held.standing).toBeGreaterThan(20);
      }
    }
    expect(wrong).toBeGreaterThan(0);
    expect(right).toBeGreaterThan(0);
  });
});
