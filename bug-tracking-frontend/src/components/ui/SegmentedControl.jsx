/**
 * Two or three mutually exclusive choices shown as one pill-shaped control.
 *   <SegmentedControl label="Mode" options={[{ value, label, icon }]} value={v} onChange={setV} />
 */
export default function SegmentedControl({ label, options, value, onChange, className = '' }) {
  return (
    <div role="radiogroup" aria-label={label} className={`grid grid-flow-col gap-1 rounded-lg bg-gray-100 p-1 ${className}`}>
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => {
        const selected = optionValue === value
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(optionValue)}
            className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition sm:text-sm ${
              selected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {Icon && <Icon size={15} aria-hidden="true" />}
            {optionLabel}
          </button>
        )
      })}
    </div>
  )
}
