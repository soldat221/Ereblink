import type { ReactNode } from "react";

type Props = {
    title: string;
    subtitle?: string;
    rightSlot?: ReactNode;
};

export default function PageHeader({ title, subtitle, rightSlot }: Props) {
    return (
        <div className="page-header">
            <div>
                <h1 className="page-title">{title}</h1>
                {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
            </div>
            {rightSlot ? <div className="page-header__actions">{rightSlot}</div> : null}
        </div>
    );
}
