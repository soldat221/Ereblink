import type { Theme } from "../hooks/useTheme";

type Props = {
    theme: Theme;
    onToggle: () => void;
};

export default function ThemeToggle({ theme, onToggle }: Props) {
    const nextLabel = theme === "light" ? "Tmavý režim" : "Světlý režim";

    return (
        <button type="button" className="theme-toggle" onClick={onToggle} aria-label={nextLabel}>
            <span className="theme-toggle__icon" aria-hidden="true" />
            <span>{nextLabel}</span>
        </button>
    );
}
