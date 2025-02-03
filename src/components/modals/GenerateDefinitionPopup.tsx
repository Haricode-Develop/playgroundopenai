// src/components/modals/GenerateDefinitionPopup.tsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { createChatCompletion } from '../../services/playgroundApi';

interface Props {
    anchorRect: DOMRect | null;
    currentDefinition: string;
    onClose: () => void;
    onSubmit: (newDefinition: string) => void;
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
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!anchorRect) {
            onClose();
        }
    }, [anchorRect, onClose]);

    const hasValue = currentDefinition.trim() !== '';

    async function handleCreateOrUpdate() {
        if (!prompt.trim()) {
            return;
        }
        setLoading(true);
        setErrorMsg(null);

        try {
            // Llamada a la API con el prompt del usuario, para generar un function definition
            // Por ejemplo, decimos "act as a function definition generator"...
            const { data } = await createChatCompletion({
                model: 'gpt-3.5-turbo', // Ajusta el modelo
                messages: [
                    { role: 'system', content: 'Actúa como generador de definiciones JSON de funciones' },
                    { role: 'user', content: `Crea una definición JSON para: ${prompt}` }
                ],
                temperature: 0.7,
                max_tokens: 200
            });

            const generatedJson = data.choices[0]?.message?.content || '(no definition)';

            // Llamamos a onSubmit con el JSON devuelto
            onSubmit(generatedJson);

            onClose();
        } catch (err: any) {
            setErrorMsg(err.message || String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <PopupContainer anchorRect={anchorRect}>
            <Title>Describe what your function does (or paste your code).</Title>
            <Info>We'll generate a definition.</Info>

            {errorMsg && (
                <div style={{ color: 'red', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    Error: {errorMsg}
                </div>
            )}

            <PromptArea
                placeholder="Enter your prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
            />

            <ButtonRow>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button $primary onClick={handleCreateOrUpdate} disabled={loading}>
                    {hasValue ? 'Update' : 'Create'}
                </Button>
            </ButtonRow>
        </PopupContainer>
    );
};

export default GenerateDefinitionPopup;
