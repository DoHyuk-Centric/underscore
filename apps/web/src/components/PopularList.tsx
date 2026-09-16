import type { ReactNode } from "react";
import { ListRow } from "@toss/tds-mobile";
import "./PopularList.css";

const INITIAL_ITEM_COUNT = 5;

export type PopularListItem = {
  key: string;
  rank: number;
  name: string;
  detail: string;
  right: ReactNode;
};

type Props = {
  items: PopularListItem[];
  expanded: boolean;
  onSelect?: (key: string) => void;
};

export function PopularList({ items, expanded, onSelect }: Props) {
  return (
    <ol className="m-0 list-none p-0">
      {items.map((item, index) => {
        const collapsed = index >= INITIAL_ITEM_COUNT && !expanded;

        return (
          <li
            key={item.key}
            className="popular-list__row"
            data-collapsed={collapsed}
            aria-hidden={collapsed || undefined}
          >
            <div className="popular-list__clip">
              <div
                className={index > 0 ? "border-t border-[#f0f1f3]" : undefined}
              >
                <ListRow
                  style={{ minHeight: "var(--popular-list-row-height, 80px)" }}
                  left={
                    <span className="inline-block w-5 text-center text-[15px] font-bold text-[#6b7684]">
                      {item.rank}
                    </span>
                  }
                  contents={
                    <span className="grid gap-1">
                      <strong className="text-[15px] text-[#191f28]">
                        {item.name}
                      </strong>
                      <small className="text-xs text-[#8b95a1]">
                        {item.detail}
                      </small>
                    </span>
                  }
                  right={item.right}
                  border="none"
                  horizontalPadding="small"
                  verticalPadding="medium"
                  withTouchEffect
                  onClick={onSelect ? () => onSelect(item.key) : undefined}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
