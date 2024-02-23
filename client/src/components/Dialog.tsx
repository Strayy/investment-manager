import "../styles/components/_dialog.scss";

function Dialog({
    dialogContent,
    closeAction,
}: {
    dialogContent: JSX.Element;
    closeAction: (newValue: boolean) => void;
}): JSX.Element {
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
