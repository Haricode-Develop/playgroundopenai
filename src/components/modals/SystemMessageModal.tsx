import React from 'react';
import styled from 'styled-components';

interface Props {
    onClose: () => void;
    onOpenGenerateModal: () => void;
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
    width: 500px;
    max-width: 95%;
    border-radius: 8px;
    overflow: auto;
    max-height: 90vh;
    box-shadow: 0 4px 8px rgba(0,0,0,0.6);
`;

const Title = styled.h2`
    margin-bottom: 1rem;
`;

const Text = styled.p`
    font-size: 0.9rem;
    color: #ccc;
    margin-bottom: 1rem;
`;

const ButtonsRow = styled.div`
    display: flex;
    justify-content: flex-end;
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

const SystemMessageModal: React.FC<Props> = ({ onClose, onOpenGenerateModal }) => {
    return (
        <Overlay>
            <Container>
                <Title>System Message</Title>
                <Text>
                    Aquí puedes establecer o editar el prompt de sistema inicial.
                    Presiona <strong>Generate</strong> para abrir la ventana y escribir el mensaje.
                </Text>

                <ButtonsRow>
                    <Button onClick={onOpenGenerateModal}>Generate</Button>
                    <Button onClick={onClose}>Close</Button>
                </ButtonsRow>
            </Container>
        </Overlay>
    );
};

export default SystemMessageModal;
