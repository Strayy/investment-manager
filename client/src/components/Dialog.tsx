import { useEffect } from "react";
import "../styles/components/_dialog.scss";

function Dialog({
    dialogContent,
    closeAction,
}: {
    dialogContent: JSX.Element;
    closeAction: (newValue: boolean) => void;
}): JSX.Element {
    // Handle keyboard shortcut for closing panel when <esc> key pressed
    useEffect(() => {
        const closeWindow = (event: any) => {
            if (event.key == "Escape") {
                closeAction(false);
            }
        };

        window.addEventListener("keydown", closeWindow);

        return () => {
            window.removeEventListener("keydown", closeWindow);
        };
    });

    return (
        <div className='dialog'>
            <div className='dialog-close' onClick={() => closeAction(false)}></div>
            <div className='dialog-box'>
                {dialogContent}
                <i className='fi fi-br-cross' onClick={() => closeAction(false)}></i>
            </div>
        </div>
    );
}

export default Dialog;
