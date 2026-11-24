import { useEffect } from "react";

import "../styles/ConfirmDialog.css";

function ConfirmDialog({ visible, text, onConfirm, onCancel }) {
    useEffect(() => {
        if(visible) {
            document.body.style.overflow = "hidden";

            return () => {
                document.body.style.overflow = "auto";
            };
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <div id="container-confirm-dialog">
            <div id="confirm-dialog">
                { text }
                
                <div id="container-buttons">
                    <span onClick={onConfirm}>Yes</span>
                    <span onClick={onCancel}>No</span>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;