// src/components/chat/MessageBubble.tsx

import React from 'react';
import styled from 'styled-components';
import {
    FiTrash2,
    FiThumbsDown,
    FiCode,
    FiBox
} from 'react-icons/fi';

export interface IMessageData {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    isDisliked?: boolean;
    isJson?: boolean;
    originalContent?: string;
}

interface MessageBubbleProps {
    message: IMessageData;
    onDelete: (id: number) => void;
    onToggleDislike: (id: number, e?: React.MouseEvent<HTMLButtonElement>) => void;
    onToggleJSON: (id: number) => void;

    // Nuevo: para abrir popup de funciones
    onOpenFunctionsPopup?: (id: number, e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Bubble = styled.div<{ role: 'user' | 'assistant' }>`
    background-color: ${({ role }) => (role === 'user' ? '#3a3a3a' : '#2f2f2f')};
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    white-space: pre-wrap;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const RoleLabel = styled.span`
    font-size: 0.8rem;
    color: #888;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const IconButton = styled.button<{ active?: boolean }>`
    background: transparent;
    border: none;
    color: ${({ active }) => (active ? '#fff' : '#888')};
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
        color: #fff;
    }
`;

const ContentText = styled.div`
    margin-top: 0.25rem;
    font-size: 0.9rem;
    line-height: 1.3;
`;

const MessageBubble: React.FC<MessageBubbleProps> = ({
                                                         message,
                                                         onDelete,
                                                         onToggleDislike,
                                                         onToggleJSON,
                                                         onOpenFunctionsPopup
                                                     }) => {
    const { id, role, content, isDisliked } = message;

    const renderAssistantButtons = () => {
        return (
            <>
                {/* Dislike */}
                <IconButton title="Dislike" onClick={(e) => onToggleDislike(id, e)} active={isDisliked}>
                    <FiThumbsDown />
                </IconButton>
                {/* Format JSON */}
                <IconButton title="Format to JSON" onClick={() => onToggleJSON(id)}>
                    <FiCode />
                </IconButton>
                {/* Functions */}
                {onOpenFunctionsPopup && (
                    <IconButton
                        title="Select function"
                        onClick={(e) => onOpenFunctionsPopup(id, e)}
                    >
                        <FiBox />
                    </IconButton>
                )}
                {/* Delete */}
                <IconButton title="Delete" onClick={() => onDelete(id)}>
                    <FiTrash2 />
                </IconButton>
            </>
        );
    };

    const renderUserButtons = () => (
        <IconButton onClick={() => onDelete(id)} title="Delete">
            <FiTrash2 />
        </IconButton>
    );

    return (
        <Bubble role={role}>
            <HeaderRow>
                <RoleLabel>{role === 'assistant' ? 'Assistant' : 'User'}</RoleLabel>
                <ActionButtons>
                    {role === 'assistant' ? renderAssistantButtons() : renderUserButtons()}
                </ActionButtons>
            </HeaderRow>
            <ContentText>{content}</ContentText>
        </Bubble>
    );
};

export default MessageBubble;
