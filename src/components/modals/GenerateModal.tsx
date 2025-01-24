import React, { useState } from 'react';
import styled from 'styled-components';

interface Props {
    contextType: 'system' | 'function';
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
    background-color: #2a2a2a;
    width: 600px;
    max-width: 95%;
    max-height: 90vh;
    overflow: auto;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.6);
    display: flex;
    flex-direction: column;
`;

const Header = styled.div`
    padding: 1rem;
    border-bottom: 1px solid #444;
    color: #fff;
    font-weight: bold;
`;

const Body = styled.div`
    padding: 1rem;
    flex: 1;
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 300px;
    background-color: #1f1f1f;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0.75rem;
    resize: vertical;
`;

const Footer = styled.div`
    border-top: 1px solid #444;
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
    border: none;
    padding: 0.5rem 1rem;
    background-color: ${({ $primary }) => ($primary ? '#00a37a' : '#3a3a3a')};
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    font-weight: ${({ $primary }) => ($primary ? 'bold' : 'normal')};

    &:hover {
        background-color: ${({ $primary }) => ($primary ? '#00b88c' : '#4a4a4a')};
    }
`;

const GenerateModal: React.FC<Props> = ({ contextType, onClose }) => {
    const defaultSystem = `You are a helpful assistant that ...\nMore instructions here...`;
    const defaultFunction = `{
  "name": "new_function",
  "description": "Function description",
  "parameters": {
     ...
  }
}`;

    const [content, setContent] = useState(
        contextType === 'system' ? defaultSystem : defaultFunction
    );

    const handleCreate = () => {
        // Podrías pasar el contenido donde necesites
        onClose();
    };

    return (
        <Overlay>
            <Container>
                <Header>
                    {contextType === 'system' ? 'Generate System Message' : 'Generate Function'}
                </Header>

                <Body>
                    <TextArea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </Body>

                <Footer>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button $primary onClick={handleCreate}>Create</Button>
                </Footer>
            </Container>
        </Overlay>
    );
};

export default GenerateModal;
