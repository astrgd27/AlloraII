import { WORLD, type Order, type Snapshot } from '@allora/engine';
import { ordinal, pf } from './format';

const items = new Map((WORLD.items ?? []).map((i) => [i.id, i]));
const markets = new Map((WORLD.markets ?? []).map((m) => [m.id, m]));
const toolOf = new Map((WORLD.tools ?? []).map((t) => [t.item, t]));
const skillName = new Map((WORLD.skills ?? []).map((s) => [s.id, s.name]));
const subName = (place: string, sub: string | undefined): string =>
  (sub && WORLD.places.find((p) => p.id === place)?.subs?.[sub]) || '';

/** The market here, as a price board, and what the life carries. Display only. */
export function Market({ snapshot, send }: { snapshot: Snapshot; send: (order: Order) => void }) {
  const market = snapshot.market;
  const pack = Object.entries(snapshot.goods);
  const info = market ? markets.get(market.id) : undefined;
  const status = !market
    ? ''
    : market.open
      ? market.marketDay
        ? 'Market day: dearer to sell to, cheaper to buy from'
        : 'Open'
      : `Shut · open from the ${ordinal(info?.from ?? 0)} hour to the ${ordinal(info?.to ?? 0)}`;
  return (
    <section className="market" data-testid="market">
      {market ? (
        <>
          <p className="market-head">
            {info?.name}
            <span className="quiet"> · {subName(snapshot.place, info?.sub)}</span>
          </p>
          <p className={market.open ? 'quiet' : 'why'}>{status}</p>
          <table className="board">
            <thead>
              <tr>
                <th>Goods</th>
                <th title="What one costs here now">Buy</th>
                <th title="What one fetches here now">Sell</th>
                <th title="How many you carry">Held</th>
              </tr>
            </thead>
            <tbody>
              {market.stock.map((s) => {
                const item = items.get(s.item);
                const tool = toolOf.get(s.item);
                const closed = snapshot.blocked.market;
                return (
                  <tr key={s.item}>
                    <td
                      title={[
                        item ? `Worth about ${pf(item.value)} in the usual way of things.` : '',
                        tool
                          ? `A tool: ${tool.text} +${tool.edge} to ${skillName.get(tool.skill) ?? ''}.`
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      className={tool ? 'is-tool' : ''}
                    >
                      {item?.name ?? s.item}
                    </td>
                    <td>
                      {s.buy !== null && (
                        <button
                          type="button"
                          data-buy={s.item}
                          disabled={Boolean(closed ?? s.why)}
                          title={closed ?? s.why ?? `Buy one for ${pf(s.buy)}`}
                          onClick={() => send({ type: 'buy', item: s.item })}
                        >
                          {pf(s.buy)}
                        </button>
                      )}
                    </td>
                    <td>
                      {s.sell !== null && (
                        <button
                          type="button"
                          data-sell={s.item}
                          disabled={Boolean(closed)}
                          title={closed ?? `Sell one for ${pf(s.sell)}`}
                          onClick={() => send({ type: 'sell', item: s.item })}
                        >
                          {pf(s.sell)}
                        </button>
                      )}
                    </td>
                    <td className="num">{s.held || ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <p className="quiet">There is no market here.</p>
      )}
      <p className="pack">
        <span className="quiet">Pack: </span>
        {pack.length > 0
          ? pack.map(([id, n]) => `${items.get(id)?.name ?? id} ×${n}`).join(', ')
          : 'empty'}
      </p>
    </section>
  );
}
