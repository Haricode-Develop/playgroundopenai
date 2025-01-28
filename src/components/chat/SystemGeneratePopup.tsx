// src/components/chat/SystemGeneratePopup.tsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface Props {
    anchorRect: DOMRect | null;
    currentValue: string;
    onClose: () => void;
    onSubmit: (newText: string) => void;
}

const PopupContainer = styled.div<{ anchorRect: DOMRect | null }>`
  position: absolute;
  background-color: #1f1f1f;   /* Fondo negro */
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

const TextArea = styled.textarea`
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

const SystemGeneratePopup: React.FC<Props> = ({
                                                  anchorRect,
                                                  currentValue,
                                                  onClose,
                                                  onSubmit
                                              }) => {
    const [temp, setTemp] = useState('');

    useEffect(() => {
        if (!anchorRect) onClose();
    }, [anchorRect, onClose]);

    const handleCreateOrUpdate = () => {
        // Reemplazamos el system message con lo que escribió (temp)
        onSubmit(temp);
    };

    const hadValue = currentValue.trim().length > 0;

    return (
        <PopupContainer anchorRect={anchorRect}>
            <Title>Enter a prompt to generate</Title>
            <Info>Free beta</Info>
            <TextArea
                placeholder="Your prompt here..."
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
            />
            <ButtonRow>
                <Button onClick={onClose}>Cancel</Button>
                <Button $primary onClick={handleCreateOrUpdate}>
                    {hadValue ? 'Update' : 'Create'}
                </Button>
            </ButtonRow>
        </PopupContainer>
    );
};

export default SystemGeneratePopup;
