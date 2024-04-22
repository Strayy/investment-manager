import { useContext } from "react";

import { Context } from "../App";

import "../styles/components/_toast.scss";
import ToastElement from "./ToastElement";
import { IToastMessage } from "../types/toastMessage";

function Toast() {
    const [toastElements, setToastElements] = useContext(Context).toastMessages;

    function removeNotification(toastElementId: string) {
        setToastElements((prev: IToastMessage[]) =>
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
