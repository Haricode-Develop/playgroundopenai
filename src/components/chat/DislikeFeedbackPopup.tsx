// src/components/chat/DislikeFeedbackPopup.tsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface Props {
    anchorRect: DOMRect | null;
    onClose: () => void;
}

const PopupContainer = styled.div<{ anchorRect: DOMRect | null }>`
    position: absolute;
    background-color: #1f1f1f;
    border: 1px solid #444;
    border-radius: 6px;
    padding: 1rem;
    z-index: 9999;
    width: 300px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.5);

    ${({ anchorRect }) => {
        if (!anchorRect) return '';
        const top = anchorRect.top - 140;
        const left = anchorRect.left;
        return `
      top: ${top}px;
      left: ${left}px;
    `;
    }}
`;

const Title = styled.h3`
    margin: 0;
    font-size: 1rem;
    color: #fff;
    margin-bottom: 0.5rem;
`;

const Info = styled.div`
    font-size: 0.85rem;
    color: #bbb;
    margin-bottom: 0.5rem;
    line-height: 1.3;
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.75rem;
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

const FeedbackText = styled.textarea`
    width: 100%;
    background-color: #2a2a2a;
    border: 1px solid #555;
    border-radius: 4px;
    color: #fff;
    padding: 0.5rem;
    resize: vertical;
    margin-top: 0.5rem;
`;

const DislikeFeedbackPopup: React.FC<Props> = ({
                                                   anchorRect,
                                                   onClose
                                               }) => {
    const [stage, setStage] = useState(0);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        if (!anchorRect) onClose();
    }, [anchorRect, onClose]);

    const handleDecline = () => {
        onClose();
    };
    const handleAllow = () => {
        setStage(1);
    };

    const handleSend = () => {
        console.log('Feedback enviado:', feedback);
        onClose();
    };

    if (stage === 0) {
        return (
            <PopupContainer anchorRect={anchorRect}>
                <Title>Allow submitting feedback from the Playground?</Title>
                <Info>
                    This allows all users in your organization to share feedback and chat content...
                    You can change this at any time in <a href="#">settings</a>.
                </Info>
                <ButtonRow>
                    <Button onClick={handleDecline}>Decline</Button>
                    <Button $primary onClick={handleAllow}>Allow</Button>
                </ButtonRow>
            </PopupContainer>
        );
    }

    return (
        <PopupContainer anchorRect={anchorRect}>
            <Info>Tell us what was wrong or how the response could be improved.</Info>
            <FeedbackText
                placeholder="Enter your feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
            />
            <ButtonRow>
                <Button onClick={onClose}>Cancel</Button>
                <Button $primary onClick={handleSend}>Send</Button>
            </ButtonRow>
        </PopupContainer>
    );
};

export default DislikeFeedbackPopup;
