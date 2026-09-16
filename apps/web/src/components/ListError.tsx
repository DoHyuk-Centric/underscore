type Props = {
  message: string;
  onRetry: () => void;
};

export function ListError({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f4f6] text-lg font-bold text-[#8b95a1]"
        aria-hidden="true"
      >
        !
      </span>
      <p className="m-0 text-sm font-medium text-[#4e5968]">
        {message}
      </p>
      <button
        type="button"
        className="mt-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#3182f6]"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </div>
  );
}
