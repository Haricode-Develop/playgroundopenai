// src/components/modals/FunctionDefinitionModal.tsx
import React from 'react';
import styled from 'styled-components';
import { IFunctionDef } from '../../pages/PlaygroundPage';

interface Props {
    fnDef: IFunctionDef;
    onClose: () => void;
}

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
`;

const Container = styled.div`
    background-color: #2a2a2a;
    padding: 1rem;
    width: 600px;
    max-width: 95%;
    border-radius: 8px;
    overflow: auto;
    max-height: 90vh;
    box-shadow: 0 4px 8px rgba(0,0,0,0.6);
`;

const Title = styled.h2`
    margin-bottom: 1rem;
    color: #fff;
`;

const CodeBlock = styled.pre`
    background-color: #1f1f1f;
    color: #00ffae;
    padding: 1rem;
    border: 1px solid #444;
    border-radius: 4px;
    overflow: auto;
`;

const ButtonsRow = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
`;

const Button = styled.button`
    border: none;
    padding: 0.5rem 1rem;
    background-color: #3a3a3a;
    color: #fff;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
        background-color: #4a4a4a;
    }
`;

const FunctionDefinitionModal: React.FC<Props> = ({ fnDef, onClose }) => {
    return (
        <Overlay>
            <Container>
                <Title>Function: {fnDef.name}</Title>
                <CodeBlock>{fnDef.jsonDefinition}</CodeBlock>
                <ButtonsRow>
                    <Button onClick={onClose}>Close</Button>
                </ButtonsRow>
            </Container>
        </Overlay>
    );
};

export default FunctionDefinitionModal;
