// src/components/chat/SystemGeneratePopup.tsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// Importa tu createChatCompletion
import { createChatCompletion } from '../../services/playgroundApi';

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
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!anchorRect) {
            onClose();
        }
    }, [anchorRect, onClose]);

    const hadValue = currentValue.trim().length > 0;

    async function handleCreateOrUpdate() {
        if (!temp.trim()) {
            // Si no hay prompt => no hace nada
            return;
        }
        setLoading(true);
        setErrorMsg(null);

        try {
            // Llamada a la API para generar un system message con el prompt "temp"
            // Ejemplo: model "gpt-3.5-turbo" con un contexto
            const { data } = await createChatCompletion({
                model: 'gpt-3.5-turbo',      // O el que quieras
                messages: [
                    { role: 'system', content: 'Actúa como generador de system message' },
                    { role: 'user', content: temp }
                ],
                temperature: 0.7,
                max_tokens: 150
            });

            const generated = data.choices[0]?.message?.content || '(no response)';

            // Llamamos a onSubmit con el texto devuelto
            onSubmit(generated);

            onClose();
        } catch (err: any) {
            setErrorMsg(err.message || String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <PopupContainer anchorRect={anchorRect}>
            <Title>Enter a prompt to generate</Title>
            <Info>Free beta</Info>

            {errorMsg && (
                <div style={{ color: 'red', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    Error: {errorMsg}
                </div>
            )}

            <TextArea
                placeholder="Your prompt here..."
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                disabled={loading}
            />

            <ButtonRow>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button $primary onClick={handleCreateOrUpdate} disabled={loading}>
                    {hadValue ? 'Update' : 'Create'}
                </Button>
            </ButtonRow>
        </PopupContainer>
    );
};

export default SystemGeneratePopup;
