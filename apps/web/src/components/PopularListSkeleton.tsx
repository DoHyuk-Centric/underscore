import { ListRow } from "@toss/tds-mobile";
import "./PopularList.css";

const PLACEHOLDER_COUNT = 5;

function Bar({ width }: { width: number }) {
  return (
    <span
      className="inline-block h-3.5 animate-pulse rounded bg-[#f2f4f6]"
      style={{ width }}
    />
  );
}

export function PopularListSkeleton() {
  return (
    <ol className="m-0 list-none p-0">
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <li key={index} className="popular-list__row">
          <div className="popular-list__clip">
            <div
              className={index > 0 ? "border-t border-[#f0f1f3]" : undefined}
            >
              <ListRow
                left={<Bar width={20} />}
                contents={
                  <span className="grid gap-1">
                    <Bar width={80} />
                    <Bar width={56} />
                  </span>
                }
                right={<Bar width={48} />}
                border="none"
                horizontalPadding="small"
                verticalPadding="medium"
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
