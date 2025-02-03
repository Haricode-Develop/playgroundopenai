// src/components/modals/SystemMessageModal.tsx

import React, { FC } from 'react';
import {GlobalPopup} from "./GlobalPopup";

interface SystemMessageModalProps {
    onClose: () => void;
    onSubmit: (value: string) => void;
}

export const SystemMessageModal: FC<SystemMessageModalProps> = ({
                                                                    onClose,
                                                                    onSubmit,
                                                                }) => {
    return (
        <GlobalPopup
            title="System Message"
            content="Describe what your function does (or paste your code)."
            textAreaValue=""
            onClose={onClose}
            onSubmit={onSubmit}
            submitLabel="Create"
        />
    );
};
