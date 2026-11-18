import { WORLD, type Order, type Snapshot } from '@allora/engine';
import { ordinal, pf } from './format';

const itemName = new Map((WORLD.items ?? []).map((i) => [i.id, i.name]));
const marketName = new Map((WORLD.markets ?? []).map((m) => [m.id, m.name]));

/** The purse, the pack, and the market here. Display only. */
export function Market({ snapshot, send }: { snapshot: Snapshot; send: (order: Order) => void }) {
  const market = snapshot.market;
  const pack = Object.entries(snapshot.goods);
  const hours = (WORLD.markets ?? []).find((m) => m.id === market?.id);
  return (
    <section className="market" data-testid="market">
      <p data-testid="purse">
        {pf(snapshot.money)}
        {pack.length > 0 && (
          <span className="quiet">
            {' '}
            · {pack.map(([id, n]) => `${itemName.get(id) ?? id} ×${n}`).join(', ')}
          </span>
        )}
      </p>
      {market && (
        <details>
          <summary>
            {marketName.get(market.id)}
            <span className="quiet">
              {market.open
                ? market.marketDay
                  ? ' · market day'
                  : ''
                : ` · shut · open from the ${ordinal(hours?.from ?? 0)} hour to the ${ordinal(hours?.to ?? 0)}`}
            </span>
          </summary>
          {market.open && !snapshot.blocked.market && (
            <ul>
              {market.stock.map((s) => (
                <li key={s.item}>
                  <span>{itemName.get(s.item) ?? s.item}</span>
                  {s.buy !== null && (
                    <button
                      type="button"
                      data-buy={s.item}
                      disabled={Boolean(s.why)}
                      title={s.why ?? 'Buy one'}
                      onClick={() => send({ type: 'buy', item: s.item })}
                    >
                      Buy · {pf(s.buy)}
                    </button>
                  )}
                  {s.sell !== null && (
                    <button
                      type="button"
                      data-sell={s.item}
                      onClick={() => send({ type: 'sell', item: s.item })}
                    >
                      Sell · {pf(s.sell)}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </details>
      )}
    </section>
  );
}
