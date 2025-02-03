// src/components/chat/SystemMessagePopup.tsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FiArrowRight } from 'react-icons/fi';

interface Props {
    initialText: string;
    onClose: () => void;
    onCreate: (newText: string) => void;
    anchorRect: DOMRect | null;
}

const PopupOverlay = styled.div<{ anchorRect: DOMRect | null }>`
    position: absolute;
    z-index: 9999;
    background-color: rgba(42,42,42,0.95);
    width: 340px;
    border: 1px solid #444;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;

    ${({ anchorRect }) => {
        if (!anchorRect) return '';
        const top = anchorRect.bottom + 6;
        const left = anchorRect.left;
        return `
          top: ${top}px;
          left: ${left}px;
        `;
    }}
`;

const PromptInput = styled.textarea`
    background-color: #1f1f1f;
    color: #fff;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 0.5rem;
    resize: vertical;
    min-height: 80px;
    font-size: 0.9rem;
`;

const BetaLabel = styled.div`
    font-size: 0.8rem;
    color: #aaa;
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
`;

const CancelButton = styled.button`
    background: transparent;
    border: none;
    color: #ccc;
    cursor: pointer;
    &:hover {
        color: #fff;
    }
`;

const CreateButton = styled.button`
    background-color: #00a37a;
    color: #fff;
    border: none;
    padding: 0.4rem 0.75rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;
    font-weight: bold;
    &:hover {
        background-color: #00b88c;
    }
`;

const SystemMessagePopup: React.FC<Props> = ({
                                                 initialText,
                                                 onClose,
                                                 onCreate,
                                                 anchorRect
                                             }) => {
    const [textValue, setTextValue] = useState(initialText);

    useEffect(() => {
        if (!anchorRect) {
            onClose();
        }
    }, [anchorRect, onClose]);

    const handleCreate = () => {
        onCreate(textValue);
    };

    return (
        <PopupOverlay anchorRect={anchorRect}>
            <PromptInput
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
            />
            <BetaLabel>Free beta</BetaLabel>
            <ButtonRow>
                <CancelButton onClick={onClose}>Cancel</CancelButton>
                <CreateButton onClick={handleCreate}>
                    Create
                    <FiArrowRight />
                </CreateButton>
            </ButtonRow>
        </PopupOverlay>
    );
};

export default SystemMessagePopup;
