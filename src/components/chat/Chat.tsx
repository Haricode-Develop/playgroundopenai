import React, { useRef, useState } from 'react';
import {
    ChatContainer,
    MessagesContainer,
    TimingBar,
    TimingIconBox,
    ChatInputWrapper,
    ChatTextArea,
    BottomControls,
    LeftButtonsGroup,
    RightButtonsGroup,
    RectButton,
    RunButton,
    SystemMessageCard,
    SystemMessageHeader,
    SystemMessageContent,
    GenerateRectButton,
    CollapseButton,
    FadeInMessage
} from './chat.styles';

import { FiPaperclip, FiPlus, FiSend } from 'react-icons/fi';
import { FiZap, FiArrowUp, FiArrowDown, FiClipboard, FiChevronUp, FiChevronDown, FiStar } from 'react-icons/fi';
import MessageBubble, { IMessageData } from './MessageBubble';
import SystemMessagePopup from './SystemMessagePopup';
import FunctionsPopup from './FunctionsPopup';
import { IFunctionDef } from '../../pages/PlaygroundPage';

interface ChatProps {
    functionsList: IFunctionDef[];
    onOpenViewFunction: (fn: IFunctionDef) => void;
}

const Chat: React.FC<ChatProps> = ({ functionsList, onOpenViewFunction }) => {
    // System message
    const [systemMessage, setSystemMessage] = useState('You are a helpful assistant...');
    const [showSystemPopup, setShowSystemPopup] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    // Mensajes
    const [messages, setMessages] = useState<IMessageData[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [role, setRole] = useState<'user' | 'assistant'>('user');
    const [nextId, setNextId] = useState(1);

    // Tiempos (ejemplo)
    const timeData = {
        totalMs: '1,001ms',
        upTokens: '398t',
        downTokens: '22t',
        requestId: 'Request ID'
    };

    // Anclaje para "Generate" system message
    const generateBtnRef = useRef<HTMLButtonElement | null>(null);
    const [popupAnchorRect, setPopupAnchorRect] = useState<DOMRect | null>(null);

    // Anclaje para popup de funciones en un mensaje assistant
    const [functionsAnchorRect, setFunctionsAnchorRect] = useState<DOMRect | null>(null);
    const [currentMsgId, setCurrentMsgId] = useState<number | null>(null);

    // Enviar mensaje
    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMsg: IMessageData = {
            id: nextId,
            role,
            content: inputValue,
            isDisliked: false,
            isJson: false,
            originalContent: inputValue
        };

        setMessages((prev) => [...prev, newMsg]);
        setNextId(nextId + 1);
        setInputValue('');
    };

    // Cambiar role
    const toggleRole = () => {
        setRole((prev) => (prev === 'user' ? 'assistant' : 'user'));
    };

    // Borrar mensaje
    const handleDeleteMessage = (id: number) => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    // Dislike
    const handleToggleDislike = (id: number) => {
        setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, isDisliked: !m.isDisliked } : m))
        );
    };

    // Convertir a JSON
    const handleToggleJSON = (id: number) => {
        setMessages((prev) =>
            prev.map((m) => {
                if (m.id === id) {
                    if (!m.isJson) {
                        const jsonString = JSON.stringify(
                            { role: m.role, content: m.originalContent },
                            null,
                            2
                        );
                        return { ...m, content: jsonString, isJson: true };
                    } else {
                        return { ...m, content: m.originalContent || '', isJson: false };
                    }
                }
                return m;
            })
        );
    };

    // Crear system message
    const handleCreateSystemMessage = (text: string) => {
        setSystemMessage(text);
        setShowSystemPopup(false);
        setPopupAnchorRect(null);

        // Agrega un mensaje "assistant" con ese contenido
        const newMsg: IMessageData = {
            id: nextId,
            role: 'assistant',
            content: text,
            isDisliked: false,
            isJson: false,
            originalContent: text
        };
        setMessages((prev) => [...prev, newMsg]);
        setNextId(nextId + 1);
    };

    // Abrir popup system
    const openSystemPopup = () => {
        if (generateBtnRef.current) {
            const rect = generateBtnRef.current.getBoundingClientRect();
            setPopupAnchorRect(rect);
            setShowSystemPopup(true);
        }
    };

    // Abrir popup de funciones
    const handleOpenFunctionsPopup = (msgId: number, e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setFunctionsAnchorRect(rect);
        setCurrentMsgId(msgId);
    };

    // Seleccionar una función => reemplazar contenido
    const handleSelectFunction = (fn: IFunctionDef) => {
        if (currentMsgId == null) return;
        setMessages((prev) =>
            prev.map((m) => {
                if (m.id === currentMsgId) {
                    // Insertar la función al final
                    const newContent = `${m.content}\n\n${fn.name}({})`;
                    return { ...m, content: newContent };
                }
                return m;
            })
        );
        closeFunctionsPopup();
    };

    const closeFunctionsPopup = () => {
        setFunctionsAnchorRect(null);
        setCurrentMsgId(null);
    };

    return (
        <ChatContainer>
            {/* System message */}
            <SystemMessageCard $collapsed={collapsed}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SystemMessageHeader>System message</SystemMessageHeader>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <GenerateRectButton ref={generateBtnRef} onClick={openSystemPopup}>
                            <FiStar />
                            Generate
                        </GenerateRectButton>
                        <CollapseButton onClick={() => setCollapsed(!collapsed)}>
                            {collapsed ? <FiChevronDown /> : <FiChevronUp />}
                        </CollapseButton>
                    </div>
                </div>
                {!collapsed && (
                    <SystemMessageContent>{systemMessage}</SystemMessageContent>
                )}
            </SystemMessageCard>

            {showSystemPopup && popupAnchorRect && (
                <SystemMessagePopup
                    initialText={systemMessage}
                    onClose={() => {
                        setShowSystemPopup(false);
                        setPopupAnchorRect(null);
                    }}
                    onCreate={handleCreateSystemMessage}
                    anchorRect={popupAnchorRect}
                />
            )}

            {/* Lista de mensajes */}
            <MessagesContainer>
                {messages.map((msg) => (
                    <FadeInMessage key={msg.id}>
                        <MessageBubble
                            message={msg}
                            onDelete={handleDeleteMessage}
                            onToggleDislike={handleToggleDislike}
                            onToggleJSON={handleToggleJSON}
                            onOpenFunctionsPopup={handleOpenFunctionsPopup}
                        />
                    </FadeInMessage>
                ))}
            </MessagesContainer>

            {/* Popup de funciones */}
            {functionsAnchorRect && currentMsgId && (
                <FunctionsPopup
                    anchorRect={functionsAnchorRect}
                    functionsList={functionsList}
                    onSelectFunction={handleSelectFunction}
                    onClose={closeFunctionsPopup}
                />
            )}

            {/* Barra de tiempos */}
            <TimingBar>
                <TimingIconBox>
                    <FiZap />
                    {timeData.totalMs}
                </TimingIconBox>
                <TimingIconBox>
                    <FiArrowUp />
                    {timeData.upTokens}
                </TimingIconBox>
                <TimingIconBox>
                    <FiArrowDown />
                    {timeData.downTokens}
                </TimingIconBox>
                <TimingIconBox>
                    <FiClipboard />
                    {timeData.requestId}
                </TimingIconBox>
            </TimingBar>

            {/* Input */}
            <ChatInputWrapper>
                <ChatTextArea
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />

                <BottomControls>
                    <LeftButtonsGroup>
                        <RectButton>
                            <FiPaperclip />
                            File
                        </RectButton>
                        <RectButton onClick={toggleRole}>
                            {role === 'user' ? 'User' : 'Asst'}
                        </RectButton>
                    </LeftButtonsGroup>

                    <RightButtonsGroup>
                        <RectButton>
                            <FiPlus />
                        </RectButton>
                        <RunButton onClick={handleSend}>
                            <FiSend />
                            Run
                        </RunButton>
                    </RightButtonsGroup>
                </BottomControls>
            </ChatInputWrapper>
        </ChatContainer>
    );
};

export default Chat;
