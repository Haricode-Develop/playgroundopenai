// src/components/modals/GenerateDefinitionPopup.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface Props {
    anchorRect: DOMRect | null;
    currentDefinition: string;
    onClose: () => void;
    onSubmit: (prompt: string) => void;
}

const PopupContainer = styled.div<{ anchorRect: DOMRect | null }>`
    position: absolute;
    background-color: #1f1f1f;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 1rem;
    width: 300px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.5);
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

const Title = styled.h3`
    color: #fff;
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
`;

const Info = styled.div`
    font-size: 0.85rem;
    color: #aaa;
    margin-bottom: 0.5rem;
`;

const PromptArea = styled.textarea`
    width: 100%;
    background-color: #2a2a2a;
    border: 1px solid #555;
    border-radius: 4px;
    color: #fff;
    padding: 0.5rem;
    margin-bottom: 0.75rem;
    resize: vertical;
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
    background-color: ${({ $primary }) => ($primary ? '#00a37a' : '#3a3a3a')};
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0.4rem 0.75rem;
    cursor: pointer;

    &:hover {
        background-color: ${({ $primary }) => ($primary ? '#00b88c' : '#555')};
    }
`;

const GenerateDefinitionPopup: React.FC<Props> = ({
                                                      anchorRect,
                                                      currentDefinition,
                                                      onClose,
                                                      onSubmit
                                                  }) => {
    const [prompt, setPrompt] = useState('');

    useEffect(() => {
        if (!anchorRect) onClose();
    }, [anchorRect, onClose]);

    const handleCreateOrUpdate = () => {
        onSubmit(prompt);
    };

    const hasValue = currentDefinition.trim() !== '';

    return (
        <PopupContainer anchorRect={anchorRect}>
            <Title>Describe what your function does (or paste your code).</Title>
            <Info>We'll generate a definition.</Info>
            <PromptArea
                placeholder="Enter your prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <ButtonRow>
                <Button onClick={onClose}>Cancel</Button>
                <Button $primary onClick={handleCreateOrUpdate}>
                    {hasValue ? 'Update' : 'Create'}
                </Button>
            </ButtonRow>
        </PopupContainer>
    );
};

export default GenerateDefinitionPopup;
