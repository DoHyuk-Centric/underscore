import { ListError } from "./ListError";

type Props = {
  message: string;
  onRetry: () => void;
};

export function PopularListError({ message, onRetry }: Props) {
  return (
    <div className="flex items-center justify-center">
      <ListError message={message} onRetry={onRetry} />
    </div>
  );
}
