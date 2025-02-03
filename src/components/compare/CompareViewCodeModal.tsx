// src/components/compare/CompareViewCodeModal.tsx

import React from 'react';
import styled from 'styled-components';
import { IMessageData } from '../chat/MessageBubble';
import { IFunctionDef } from '../../pages/PlaygroundPage';

interface Props {
    side: 'left' | 'right';
    onClose: ()=>void;
    messages: IMessageData[];
    model: string;
    responseFormat: string;
    tempValue: number;
    maxTokens: number;
    topP: number;
    freqPenalty: number;
    presPenalty: number;
    functionsList: IFunctionDef[];
}

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
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
    position: relative;
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
    overflow-x: auto;
`;

const ButtonsRow = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    gap: 0.5rem;
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

const CompareViewCodeModal: React.FC<Props> = ({
                                                   side,
                                                   onClose,
                                                   messages,
                                                   model,
                                                   responseFormat,
                                                   tempValue,
                                                   maxTokens,
                                                   topP,
                                                   freqPenalty,
                                                   presPenalty,
                                                   functionsList
                                               }) => {

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    function buildPayload() {
        return {
            side,
            model,
            responseFormat,
            config: {
                temperature: tempValue,
                max_tokens: maxTokens,
                top_p: topP,
                frequency_penalty: freqPenalty,
                presence_penalty: presPenalty
            },
            functions: functionsList.map(f => ({
                name: f.name,
                jsonDefinition: f.jsonDefinition
            })),
            messages: messages.map(m => ({
                role: m.role,
                content: m.originalContent
            }))
        };
    }

    return (
        <Overlay onClick={handleOverlayClick}>
            <Container>
                <Title>{side.toUpperCase()} code</Title>
                <CodeBlock>
                    {JSON.stringify(buildPayload(), null, 2)}
                </CodeBlock>
                <ButtonsRow>
                    <Button onClick={onClose}>Close</Button>
                </ButtonsRow>
            </Container>
        </Overlay>
    );
};

export default CompareViewCodeModal;
