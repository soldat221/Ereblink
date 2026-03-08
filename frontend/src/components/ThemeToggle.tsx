import type { Theme } from "../hooks/useTheme";

type Props = {
    theme: Theme;
    onToggle: () => void;
};

export default function ThemeToggle({ theme, onToggle }: Props) {
    const nextLabel = theme === "light" ? "Dark mode" : "Light mode";

    return (
        <button type="button" className="btn btn--ghost" onClick={onToggle} aria-label={nextLabel}>
            {nextLabel}
        </button>
    );
}
