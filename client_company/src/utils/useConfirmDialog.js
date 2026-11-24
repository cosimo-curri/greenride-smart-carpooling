import { useState } from "react";

import ConfirmDialog from "../components/ConfirmDialog";

export function useConfirmDialog() {
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState("");
    const [resolver, setResolver] = useState(null);

    const showConfirm = (message) => {
        setText(message);
        setVisible(true);

        return new Promise((resolve) => {
            setResolver(() => resolve);
        });
    };

    const handleConfirm = () => {
        setVisible(false);
        resolver && resolver({ confirmed: true });
    };

    const handleCancel = () => {
        setVisible(false);
        resolver && resolver({ confirmed: false });
    };

    const dialog = (
        <ConfirmDialog
            visible={ visible }
            text={ text }
            onConfirm={ handleConfirm }
            onCancel={ handleCancel }
        />
    );

    return [showConfirm, dialog];
}