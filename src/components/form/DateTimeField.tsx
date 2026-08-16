export function DateTimeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="datetime-local"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
    />
  );
}
