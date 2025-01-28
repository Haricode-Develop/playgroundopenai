import styled, { keyframes } from 'styled-components';

export const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
`;

const fadeInFromBottom = keyframes`
    from { opacity: 0; transform: translateY(15px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const FadeInMessage = styled.div`
    animation: ${fadeInFromBottom} 0.3s ease forwards;
`;

interface SystemMessageCardProps {
    $collapsed?: boolean;
}

export const SystemMessageCard = styled.div<SystemMessageCardProps>`
    position: relative;
    background-color: #1f1f1f;
    margin: 1rem;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    transition: max-height 0.3s ease, padding 0.3s ease;
    overflow: hidden;

    ${({ $collapsed }) =>
            $collapsed
                    ? `
          max-height: 56px; 
          padding-bottom: 0;
        `
                    : `
          max-height: 400px;
        `
    }
`;

export const SystemMessageHeader = styled.div`
    font-size: 0.9rem;
    color: #fff;
    font-weight: 500;
`;

export const SystemMessageActions = styled.div`
    display: flex;
    align-items: center;
`;

export const SystemMessageToggleIcon = styled.button`
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    font-size: 1.1rem;
    display: flex;
    align-items: center;

    &:hover {
        color: #fff;
    }
`;

export const SystemMessageContent = styled.div`
    font-size: 0.9rem;
    color: #eee;
    margin-top: 0.5rem;
`;

export const SystemMessageTextarea = styled.textarea`
    width: 100%;
    background-color: #2f2f2f;
    border: 1px solid #444;
    color: #fff;
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 0.9rem;
    resize: vertical;
    margin-top: 0.25rem;
`;

export const MessagesContainer = styled.div`
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
`;

export const TimingBar = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    padding: 0.5rem 0;
`;

export const TimingIconBox = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #ccc;
    font-size: 0.85rem;

    svg {
        font-size: 1rem;
    }
`;

export const ChatInputWrapper = styled.div`
    background-color: #2f2f2f;
    margin: 1rem;
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

export const ChatTextArea = styled.textarea`
    background-color: #2f2f2f;
    border: 1px solid #2f2f2f;
    border-radius: 6px;
    color: #fff;
    padding: 0.75rem;
    font-size: 0.9rem;
    resize: none;
    outline: none;
    min-height: 80px;

    &:focus {
        border-color: #666;
    }
`;

export const BottomControls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const LeftButtonsGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

export const RightButtonsGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

export const RectButton = styled.button`
    background-color: #3a3a3a;
    border: none;
    color: #ccc;
    border-radius: 6px;
    padding: 0.4rem 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background-color: #4a4a4a;
        color: #fff;
    }

    svg {
        font-size: 1rem;
    }
`;

export const RunButton = styled(RectButton)`
    background-color: #00a37a;
    color: #fff;

    &:hover {
        background-color: #00b88c;
        color: #fff;
    }
`;
