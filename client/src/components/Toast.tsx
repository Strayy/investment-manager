import { useState } from "react";
const { v4: uuidv4 } = require("uuid");

import "../styles/components/_toast.scss";
import ToastElement from "./ToastElement";

function Toast() {
    const [toastElements, setToastElements] = useState<{ id: string; message: string }[]>([
        { id: "1", message: "TEST MESSAGE 1" },
        { id: "2", message: "TEST MESSAGE 2" },
        { id: "3", message: "TEST MESSAGE 3" },
        { id: "4", message: "TEST MESSAGE 4" },
        { id: "5", message: "TEST MESSAGE 5" },
        { id: "6", message: "TEST MESSAGE 6" },
    ]);

    function addNotification(toastMessage: string) {
        setToastElements([...toastElements, { id: uuidv4(), message: toastMessage }]);
    }

    function removeNotification(toastElementId: string) {
        setToastElements((prev) =>
            prev.filter((toastElement) => toastElement.id !== toastElementId),
        );
    }

    return (
        <div className='toast-list'>
            {toastElements.map((toastElement: { id: string; message: string }) => (
                <ToastElement
                    key={toastElement.id}
                    toastText={toastElement.message}
                    removeElement={() => {
                        removeNotification(toastElement.id);
                    }}
                />
            ))}
        </div>
    );
}

export default Toast;
