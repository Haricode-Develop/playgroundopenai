import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { IFunctionDef } from '../../pages/PlaygroundPage';
import { FiStar } from 'react-icons/fi';

interface Props {
    onClose: () => void;
    onAddFunction: (fn: IFunctionDef) => void;
}

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
`;

const ModalContainer = styled.div`
    background-color: #2a2a2a;
    padding: 1rem;
    width: 550px;
    max-width: 95%;
    border-radius: 8px;
    overflow: auto;
    max-height: 90vh;
    box-shadow: 0 4px 8px rgba(0,0,0,0.6);
`;

const Title = styled.h2`
    margin-bottom: 1rem;
`;

const Paragraph = styled.p`
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #ccc;
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
`;

const GenerateBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background-color: #3a3a3a;
    color: #fff;
    border: none;
    padding: 0.5rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #4a4a4a;
    }
`;

const TextAreaLabel = styled.label`
    display: block;
    font-size: 0.85rem;
    color: #ccc;
    margin-bottom: 0.25rem;
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 200px;
    background-color: #1f1f1f;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0.75rem;
    margin-bottom: 1rem;
    resize: vertical;
    font-size: 0.9rem;
`;

const ButtonsRow = styled.div`
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

const AddFunctionModal: React.FC<Props> = ({ onClose, onAddFunction }) => {
    const [fnContent, setFnContent] = useState<string>(`{
  "name": "get_stock_price",
  "description": "Get the current stock price",
  "parameters": {
    "type": "object",
    "properties": {
      "symbol": {
        "type": "string",
        "description": "The stock symbol"
      }
    },
    "required": ["symbol"]
  }
}`);

    const handleGenerate = () => {
        // Ejemplo de JSON:
        const generated = `{
  "name": "auto_generated",
  "description": "Generated function example",
  "parameters": {
    "type": "object",
    "properties": {
      "param1": {
        "type": "string",
        "description": "A test parameter"
      }
    },
    "required": ["param1"]
  }
}`;
        setFnContent(generated);
    };

    // Al guardar, parseamos el JSON, sacamos "name" y guardamos
    const handleSave = () => {
        try {
            const parsed = JSON.parse(fnContent);
            const name = parsed.name || 'unknown_function';
            const fnDef: IFunctionDef = {
                name,
                jsonDefinition: fnContent
            };
            onAddFunction(fnDef);
            onClose();
        } catch (err) {
            alert('Invalid JSON. Please correct it before saving.');
        }
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <Title>Add Function</Title>
                <Paragraph>
                    Define una nueva función. El nombre se tomará de la propiedad <code>"name"</code> en tu JSON.
                </Paragraph>

                <ButtonRow>
                    <GenerateBtn onClick={handleGenerate}>
                        <FiStar />
                        Generate
                    </GenerateBtn>
                </ButtonRow>

                <TextAreaLabel>Definition (JSON)</TextAreaLabel>
                <TextArea
                    value={fnContent}
                    onChange={(e) => setFnContent(e.target.value)}
                />

                <ButtonsRow>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button $primary onClick={handleSave}>Save</Button>
                </ButtonsRow>
            </ModalContainer>
        </ModalOverlay>
    );
};

export default AddFunctionModal;
