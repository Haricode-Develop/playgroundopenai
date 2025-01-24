import React, { useState } from 'react';
import styled from 'styled-components';
import { FiZap, FiArrowUp, FiArrowDown, FiClipboard } from 'react-icons/fi';

const CompareContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1;
    overflow: hidden;
    animation: fadeInCompare 0.4s ease forwards;

    @keyframes fadeInCompare {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const CompareColumn = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #333;

    &:last-child {
        border-right: none;
    }
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #2f2f2f;
    padding: 0.5rem;
    border-bottom: 1px solid #333;
`;

const ModelSelect = styled.select`
    background-color: #1f1f1f;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
    outline: none;
`;

const TimingRow = styled.div`
    display: flex;
    gap: 1rem;
    color: #ccc;
    font-size: 0.8rem;

    div {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
`;

const MessagesArea = styled.div`
    flex: 1;
    padding: 1rem;
    color: #ccc;
    overflow-y: auto;
`;

const CompareFooter = styled.div`
    width: 100%;
    background-color: #2f2f2f;
    border-top: 1px solid #333;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const CompareInput = styled.textarea`
    flex: 1;
    background-color: #1f1f1f;
    border: 1px solid #444;
    color: #fff;
    border-radius: 6px;
    padding: 0.5rem;
    min-height: 60px;
    resize: none;
    font-size: 0.9rem;

    &:focus {
        border-color: #666;
    }
`;

const SendButton = styled.button`
    background-color: #00a37a;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s ease;

    &:hover {
        background-color: #00b88c;
    }
`;

const MessageBubble = styled.div`
    background-color: #3a3a3a;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    white-space: pre-wrap;
`;

const TimingBar = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0;
    background-color: #2f2f2f;
    border-top: 1px solid #333;

    div {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: #ccc;
        font-size: 0.8rem;
    }
`;

const CompareView: React.FC = () => {
    const [modelLeft, setModelLeft] = useState('gpt-4o');
    const [modelRight, setModelRight] = useState('gpt-4o-mini');

    const [messagesLeft, setMessagesLeft] = useState<string[]>([]);
    const [messagesRight, setMessagesRight] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (!inputValue.trim()) return;

        setMessagesLeft((prev) => [...prev, inputValue]);
        setMessagesRight((prev) => [...prev, inputValue]);
        setInputValue('');
    };

    return (
        <>
            <CompareContainer>
                {/* Columna izquierda */}
                <CompareColumn>
                    <TopBar>
                        <ModelSelect
                            value={modelLeft}
                            onChange={(e) => setModelLeft(e.target.value)}
                        >
                            <option>gpt-4o</option>
                            <option>gpt-4o-mini</option>
                            <option>01-preview-2024-09-12</option>
                        </ModelSelect>
                        <TimingRow>
                            <div>
                                <FiZap />
                                2,302ms
                            </div>
                            <div>
                                <FiArrowUp />
                                434t
                            </div>
                            <div>
                                <FiArrowDown />
                                95t
                            </div>
                            <div>
                                <FiClipboard />
                                RequestID
                            </div>
                        </TimingRow>
                    </TopBar>

                    <MessagesArea>
                        {messagesLeft.map((msg, idx) => (
                            <MessageBubble key={idx}>{msg}</MessageBubble>
                        ))}
                    </MessagesArea>

                    <TimingBar>
                        <div>
                            <FiZap />
                            2,302ms
                        </div>
                        <div>
                            <FiArrowUp />
                            434t
                        </div>
                        <div>
                            <FiArrowDown />
                            95t
                        </div>
                        <div>
                            <FiClipboard />
                            RequestID
                        </div>
                    </TimingBar>
                </CompareColumn>

                {/* Columna derecha */}
                <CompareColumn>
                    <TopBar>
                        <ModelSelect
                            value={modelRight}
                            onChange={(e) => setModelRight(e.target.value)}
                        >
                            <option>gpt-4o</option>
                            <option>gpt-4o-mini</option>
                            <option>01-preview-2024-09-12</option>
                        </ModelSelect>
                        <TimingRow>
                            <div>
                                <FiZap />
                                2,100ms
                            </div>
                            <div>
                                <FiArrowUp />
                                400t
                            </div>
                            <div>
                                <FiArrowDown />
                                87t
                            </div>
                            <div>
                                <FiClipboard />
                                RequestID
                            </div>
                        </TimingRow>
                    </TopBar>

                    <MessagesArea>
                        {messagesRight.map((msg, idx) => (
                            <MessageBubble key={idx}>{msg}</MessageBubble>
                        ))}
                    </MessagesArea>

                    <TimingBar>
                        <div>
                            <FiZap />
                            2,100ms
                        </div>
                        <div>
                            <FiArrowUp />
                            400t
                        </div>
                        <div>
                            <FiArrowDown />
                            87t
                        </div>
                        <div>
                            <FiClipboard />
                            RequestID
                        </div>
                    </TimingBar>
                </CompareColumn>
            </CompareContainer>

            {/* Input central */}
            <CompareFooter>
                <CompareInput
                    placeholder="Type your message and run in both..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <SendButton onClick={handleSend}>Run</SendButton>
            </CompareFooter>
        </>
    );
};

export default CompareView;
