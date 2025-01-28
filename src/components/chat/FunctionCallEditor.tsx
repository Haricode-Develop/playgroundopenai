// src/components/chat/FunctionCallEditor.tsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { IFunctionDef } from '../../pages/PlaygroundPage';
import { FiX } from 'react-icons/fi';

interface Props {
    fn: IFunctionDef;
    onClose: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  background-color: #2f2f2f;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 1rem;
`;

const CloseIcon = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.7rem;
  cursor: pointer;
  font-size: 1.1rem;
  color: #ccc;
  &:hover {
    color: #fff;
  }
`;

const Title = styled.h3`
  margin: 0;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const Label = styled.div`
  font-size: 0.9rem;
  color: #ccc;
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
  font-weight: bold;
`;

const TextArea = styled.textarea`
  width: 100%;
  background-color: #1f1f1f;
  border: 1px solid #444;
  border-radius: 4px;
  color: #eee;
  padding: 0.75rem;
  resize: vertical;
  font-size: 0.9rem;
  min-height: 120px;
`;

const Hint = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.2rem;
`;

const FunctionCallEditor: React.FC<Props> = ({ fn, onClose }) => {
    // Almacena la “definición” (parámetros) y la “respuesta”
    const [functionCall, setFunctionCall] = useState(fn.jsonDefinition);
    const [functionResponse, setFunctionResponse] = useState('');

    // Clic afuera => close
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <Overlay onClick={handleOverlayClick}>
            <Container>
                <CloseIcon onClick={onClose}>
                    <FiX/>
                </CloseIcon>

                <Title>{fn.name}</Title>

                {/* 1er recuadro: la function con parámetros */}
                <Label>{fn.name}({`{ ... }`})</Label>
                <TextArea
                    value={functionCall}
                    onChange={(e) => setFunctionCall(e.target.value)}
                />

                {/* 2do recuadro: la respuesta */}
                <Label>RESPONSE</Label>
                <TextArea
                    value={functionResponse}
                    onChange={(e) => setFunctionResponse(e.target.value)}
                    placeholder=''
                />
                <Hint>Press tab to generate a response or enter one manually e.g. {"{ \"success\": true }"}</Hint>
            </Container>
        </Overlay>
    );
};

export default FunctionCallEditor;
