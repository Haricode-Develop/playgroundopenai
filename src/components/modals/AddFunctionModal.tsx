// src/components/modals/AddFunctionModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { IFunctionDef } from '../../pages/PlaygroundPage';
import GenerateDefinitionPopup from './GenerateDefinitionPopup';

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Container = styled.div`
    background-color: #1f1f1f;
    width: 600px;
    max-width: 95%;
    max-height: 90vh;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.6);
    display: flex;
    flex-direction: column;
    position: relative;
    /* Quitamos overflow: auto para que el popup de examples no se corte */
`;

const Header = styled.div`
    padding: 1rem;
    border-bottom: 1px solid #444;
    color: #fff;
    font-weight: bold;
    font-size: 1rem;
    display: flex;
    justify-content: space-between;
`;

const Title = styled.span``;

const Body = styled.div`
    padding: 1rem;
    flex: 1;
`;

const SubTitle = styled.p`
    color: #ccc;
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
`;

const TextArea = styled.textarea`
    width: 100%;
    background-color: #111;
    color: #ccc;
    border: 1px solid #444;
    border-radius: 6px;
    padding: 0.75rem;
    min-height: 300px;
    resize: vertical;
    font-size: 0.9rem;
`;

const Footer = styled.div`
    border-top: 1px solid #444;
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const LeftButtons = styled.div`
    display: flex;
    gap: 0.5rem;
    position: relative;
`;

const RightButtons = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
    border: none;
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    border-radius: 4px;
    cursor: pointer;
    background-color: ${({ $primary }) => ($primary ? '#00a37a' : '#3a3a3a')};
    color: #fff;

    &:hover {
        background-color: ${({ $primary }) => ($primary ? '#00b88c' : '#4a4a4a')};
    }
`;

interface AddFunctionModalProps {
    mode: 'add' | 'edit';
    initialFn?: IFunctionDef;
    onClose: () => void;
    onAddFunction: (fn: IFunctionDef) => void;
}

export const AddFunctionModal: React.FC<AddFunctionModalProps> = ({
                                                                      mode,
                                                                      initialFn,
                                                                      onClose,
                                                                      onAddFunction,
                                                                  }) => {

    const [jsonValue, setJsonValue] = useState(
        initialFn?.jsonDefinition ||
        `{
  "name": "get_stock_price",
  "description": "Get the current stock price",
  "parameters": {
    ...
  }
}`
    );

    // Al guardar
    const handleSave = () => {
        try {
            const parsed = JSON.parse(jsonValue);
            const fnDef: IFunctionDef = {
                name: parsed.name || 'Unnamed Function',
                jsonDefinition: jsonValue
            };
            onAddFunction(fnDef);
            onClose();
        } catch (err) {
            alert('Invalid JSON format');
        }
    };

    // Clic fuera => cerrar modal
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    /** Popup "Generate" */
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const handleGenerateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setAnchorRect(rect);
    };
    const handleCloseGeneratePopup = () => setAnchorRect(null);
    const handleSubmitGenerate = (prompt: string) => {
        const newJson = `{
  "name": "generated_fn",
  "description": "Auto definition from prompt: ${prompt}",
  "parameters": {
    "type": "object"
  }
}`;
        setJsonValue(newJson);
        setAnchorRect(null);
    };

    /** Popup "Examples" */
    const [showExamples, setShowExamples] = useState(false);
    const [examplesRect, setExamplesRect] = useState<DOMRect | null>(null);

    // Ref para la cajita de examples
    const examplesRef = useRef<HTMLDivElement>(null);

    // doc-click => cierra si el clic NO fue dentro del examplesRef
    useEffect(() => {
        const handleDocClick = (evt: MouseEvent) => {
            if (!showExamples || !examplesRect) return;
            // Verificamos si no clickeó la cajita
            if (examplesRef.current && !examplesRef.current.contains(evt.target as Node)) {
                setShowExamples(false);
                setExamplesRect(null);
            }
        };
        document.addEventListener('mousedown', handleDocClick);
        return () => {
            document.removeEventListener('mousedown', handleDocClick);
        };
    }, [showExamples, examplesRect]);

    const handleExamplesClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        setExamplesRect(r);
        setShowExamples(!showExamples);
    };

    // Al elegir un example => se setea en la definition
    const handleSelectExample = (example: string) => {
        if (example === 'get_weather') {
            setJsonValue(`{
  "name": "get_weather",
  "description": "Get weather for a specific city",
  "parameters": {
    "type": "object",
    "required": ["city_name","country_code","units","lang"],
    "properties": {
      "city_name": {
        "type": "string",
        "description": "Name of the city to get the weather for"
      },
      "country_code": {
        "type": "string",
        "description": "ISO 3166-1 alpha-2 country code"
      },
      "units": {
        "type": "string",
        "description": "Units of measurement (e.g., metric, imperial)",
        "enum": ["metric", "imperial", "standard"]
      },
      "lang": {
        "type": "string",
        "description": "Language code (e.g., en, es, fr)"
      }
    }
  }
}`);
        } else {
            // get_stock_price
            setJsonValue(`{
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
        }
        setShowExamples(false);
        setExamplesRect(null);
    };

    return (
        <Overlay onClick={handleOverlayClick}>
            <Container>
                <Header>
                    <Title>{mode === 'add' ? 'Add function' : 'Edit function'}</Title>
                </Header>

                <Body>
                    <SubTitle>
                        The model will decide to call functions based on input...
                    </SubTitle>
                    <p style={{ color: '#ccc', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                        <strong>Definition</strong>
                    </p>
                    <TextArea
                        value={jsonValue}
                        onChange={e => setJsonValue(e.target.value)}
                    />
                </Body>

                <Footer>
                    <LeftButtons>
                        <Button onClick={handleGenerateClick}>Generate</Button>
                        <Button onClick={handleExamplesClick}>Examples</Button>

                        {showExamples && examplesRect && (
                            <div
                                ref={examplesRef}
                                style={{
                                    position: 'fixed',
                                    zIndex: 999999,
                                    background: '#2f2f2f',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    padding: '0.25rem',
                                    top: examplesRect.top - 70 + 'px',
                                    left: (examplesRect.left + examplesRect.width / 2 - 75) + 'px',
                                    width: '150px'
                                }}
                            >
                                <div
                                    style={{ padding: '0.25rem 0.5rem', cursor: 'pointer', color: '#ccc' }}
                                    onClick={() => handleSelectExample('get_weather')}
                                >
                                    get_weather()
                                </div>
                                <div
                                    style={{ padding: '0.25rem 0.5rem', cursor: 'pointer', color: '#ccc' }}
                                    onClick={() => handleSelectExample('get_stock_price')}
                                >
                                    get_stock_price()
                                </div>
                            </div>
                        )}
                    </LeftButtons>

                    <RightButtons>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button $primary onClick={handleSave}>Save</Button>
                    </RightButtons>
                </Footer>
            </Container>

            {anchorRect && (
                <GenerateDefinitionPopup
                    anchorRect={anchorRect}
                    currentDefinition={jsonValue}
                    onClose={handleCloseGeneratePopup}
                    onSubmit={handleSubmitGenerate}
                />
            )}
        </Overlay>
    );
};
