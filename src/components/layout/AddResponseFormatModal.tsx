// src/components/modals/AddResponseFormatModal.tsx

import React from 'react';
import styled from 'styled-components';

interface Props {
    onClose: () => void;
}

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
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
`;

const Description = styled.p`
    font-size: 0.9rem;
    color: #ccc;
    margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 250px;
    background-color: #1f1f1f;
    color: #fff;
    border: 1px solid #444;
    padding: 0.75rem;
    border-radius: 4px;
`;

const ButtonsRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    gap: 0.5rem;
`;

const BtnLeft = styled.div`
    display: flex;
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

const AddResponseFormatModal: React.FC<Props> = ({ onClose }) => {
    return (
        <Overlay>
            <Container>
                <Title>Add response format</Title>
                <Description>Use a JSON schema to define the structure of the model's response format.</Description>
                <TextArea defaultValue={`{
  "name": "math_response",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "steps": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "explanation": {
              "type": "string"
            },
            "output": {
              "type": "string"
            }
          },
          "required": ["explanation", "output"],
          "additionalProperties": false
        }
      },
      "final_answer": {
        "type": "string"
      }
    },
    "additionalProperties": false,
    "required": ["steps", "final_answer"]
  }
}`} />

                <ButtonsRow>
                    <BtnLeft>
                        <Button>Generate</Button>
                        <Button>Examples</Button>
                    </BtnLeft>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button onClick={onClose}>Save</Button>
                    </div>
                </ButtonsRow>
            </Container>
        </Overlay>
    );
};

export default AddResponseFormatModal;
