// src/components/modals/GlobalPopup.tsx

import React, { useState, FC } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
`;

const ModalContainer = styled.div`
    background-color: #2a2a2a;
    padding: 1rem;
    width: 500px;
    max-width: 95%;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
    overflow: auto;
    max-height: 90vh;
`;

const ModalHeader = styled.h2`
    margin-bottom: 1rem;
    font-size: 1.2rem;
    color: #fff;
`;

const ModalContent = styled.div`
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #ccc;
`;

const TextArea = styled.textarea`
    width: 100%;
    background-color: #1f1f1f;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0.75rem;
    margin-bottom: 1rem;
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
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    background-color: ${({ $primary }) => ($primary ? '#00a37a' : '#3a3a3a')};
    color: #fff;
    &:hover {
        background-color: ${({ $primary }) => ($primary ? '#00b88c' : '#4a4a4a')};
    }
`;

interface GlobalPopupProps {
    title: string;
    content: string;
    textAreaValue?: string;
    onClose: () => void;
    onSubmit: (value: string) => void;
    submitLabel?: string;
    cancelLabel?: string;
}

export const GlobalPopup: FC<GlobalPopupProps> = ({
                                                      title,
                                                      content,
                                                      textAreaValue = '',
                                                      onClose,
                                                      onSubmit,
                                                      submitLabel = 'Save',
                                                      cancelLabel = 'Cancel',
                                                  }) => {
    const [value, setValue] = useState(textAreaValue);

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>{title}</ModalHeader>
                <ModalContent>{content}</ModalContent>
                <TextArea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <ButtonRow>
                    <Button onClick={onClose}>{cancelLabel}</Button>
                    <Button $primary onClick={() => onSubmit(value)}>
                        {submitLabel}
                    </Button>
                </ButtonRow>
            </ModalContainer>
        </ModalOverlay>
    );
};
