import { useEffect, useState } from "react";

function ToastElement({
    toastText,
    removeElement,
}: {
    toastText: string;
    removeElement: () => void;
}) {
    const [visible, setVisible] = useState<boolean>(true);

    useEffect(() => {
        if (!visible) {
            setTimeout(() => {
                removeElement();
            }, 250);
        }
    }, [visible]);

    return (
        <div
            className={visible ? "toast-element" : "toast-element fade-out"}
            onClick={() => {
                setVisible(false);
            }}
        >
            <div className='toast-content'>{toastText}</div>
        </div>
    );
}
export default ToastElement;
