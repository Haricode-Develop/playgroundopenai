import React from 'react';
import styled from 'styled-components';

interface Props {
    onClose: () => void;
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
    width: 600px;
    max-width: 95%;
    border-radius: 8px;
    overflow: auto;
    max-height: 90vh;
    box-shadow: 0 4px 8px rgba(0,0,0,0.6);
`;

const Title = styled.h2`
    margin-bottom: 1rem;
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

const ViewCodeModal: React.FC<Props> = ({ onClose }) => {
    return (
        <ModalOverlay>
            <ModalContainer>
                <Title>View code</Title>
                <CodeBlock>
                    {`POST /v1/completions

from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
  model="gpt-4o",
  messages=[
    {"role": "system", "content": "Create a system prompt..."},
    {"role": "user", "content": "Hi"},
    {"role": "assistant", "content": "Hello! How can I assist you today..."},
  ]
)

print(response)
`}
                </CodeBlock>
                <ButtonsRow>
                    <Button onClick={onClose}>Close</Button>
                </ButtonsRow>
            </ModalContainer>
        </ModalOverlay>
    );
};

export default ViewCodeModal;
