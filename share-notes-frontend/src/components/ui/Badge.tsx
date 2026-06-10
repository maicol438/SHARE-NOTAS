interface BadgeProps {
  label: string;
  color?: string;
  onRemove?: () => void;
}

const Badge = ({ label, color, onRemove }: BadgeProps) => {
  const isHexColor = (c?: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(c || '');

  if (isHexColor(color)) {
    return (
      <span className="chip" style={{ borderColor: color + '40', backgroundColor: color + '15', color }}>
        {label}
        {onRemove && (
          <button onClick={onRemove} className="hover:opacity-60 transition-opacity ml-0.5">&times;</button>
        )}
      </span>
    );
  }

  return (
    <span className="chip">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-60 transition-opacity ml-0.5">&times;</button>
      )}
    </span>
  );
};

export default Badge;
