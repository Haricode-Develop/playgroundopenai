// src/components/chat/SystemMessageAnchorPopup.tsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface Props {
    anchorRect: DOMRect | null;
    currentValue: string;
    onClose: () => void;
    onSubmit: (prompt: string) => void;
}

const PopupContainer = styled.div<{ anchorRect: DOMRect | null }>`
    position: absolute;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    width: 300px;
    z-index: 9999;

    ${({ anchorRect }) => {
        if (!anchorRect) return '';
        const top = anchorRect.top - 10;
        const left = anchorRect.right + 10;
        return `
      top: ${top}px;
      left: ${left}px;
    `;
    }}
`;

const Title = styled.div`
    font-weight: 500;
    margin-bottom: 0.5rem;
`;

const BetaLabel = styled.div`
    font-size: 0.8rem;
    color: #777;
    margin-bottom: 0.5rem;
`;

const TextArea = styled.textarea`
    width: 100%;
    background: #f7f7f7;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.5rem;
    margin-bottom: 0.75rem;
    resize: vertical;
    font-size: 0.9rem;
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
    border: none;
    padding: 0.4rem 0.7rem;
    border-radius: 4px;
    cursor: pointer;
    background-color: ${({ $primary }) => ($primary ? '#00a37a' : '#ddd')};
    color: ${({ $primary }) => ($primary ? '#fff' : '#333')};
    font-weight: ${({ $primary }) => ($primary ? 'bold' : 'normal')};

    &:hover {
        background-color: ${({ $primary }) => ($primary ? '#00b88c' : '#ccc')};
    }
`;

const SystemMessageAnchorPopup: React.FC<Props> = ({
                                                       anchorRect,
                                                       currentValue,
                                                       onClose,
                                                       onSubmit
                                                   }) => {
    const [prompt, setPrompt] = useState(currentValue);

    useEffect(() => {
        if (!anchorRect) {
            onClose();
        }
    }, [anchorRect, onClose]);

    const handleCreateOrUpdate = () => {
        onSubmit(prompt);
    };

    return (
        <PopupContainer anchorRect={anchorRect}>
            <Title>What would you like to change?</Title>
            <BetaLabel>Free beta</BetaLabel>
            <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <ButtonRow>
                <Button onClick={onClose}>Cancel</Button>
                <Button $primary onClick={handleCreateOrUpdate}>
                    {currentValue.trim() ? 'Update' : 'Create'}
                </Button>
            </ButtonRow>
        </PopupContainer>
    );
};

export default SystemMessageAnchorPopup;
