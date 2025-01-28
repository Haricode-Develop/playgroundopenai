// src/components/chat/Chat.tsx

import React, { useState } from 'react';
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
    SystemMessageToggleIcon,
    SystemMessageActions,
    SystemMessageTextarea,
    FadeInMessage
} from './chat.styles';

import {
    FiPaperclip,
    FiPlus,
    FiSend,
    FiZap,
    FiArrowUp,
    FiArrowDown,
    FiClipboard,
    FiEdit
} from 'react-icons/fi';

import MessageBubble, { IMessageData } from './MessageBubble';
import FunctionsPopup from './FunctionsPopup';
import SystemGeneratePopup from './SystemGeneratePopup';
import AttachmentsPopup from './AttachmentsPopup';
import DislikeFeedbackPopup from './DislikeFeedbackPopup';
import { IFunctionDef } from '../../pages/PlaygroundPage';

/**
 * Extendemos IMessageData para que un msg de 'assistant' pueda tener
 * functionJson y functionResponse (la edición in-line de la función)
 */
interface IAssistantFnData {
    functionJson?: string;       // texto JSON de la función
    functionResponse?: string;   // texto del response
}
type ExtMessageData = IMessageData & IAssistantFnData;

interface ChatProps {
    functionsList: IFunctionDef[];
    messages: ExtMessageData[];
    setMessages: React.Dispatch<React.SetStateAction<ExtMessageData[]>>;
    onAddHistory: (m: IMessageData) => void;
}

const Chat: React.FC<ChatProps> = ({
                                       functionsList,
                                       messages,
                                       setMessages,
                                       onAddHistory
                                   }) => {
    // system message
    const [systemMessage, setSystemMessage] = useState('You are a helpful assistant...');
    const [collapsed, setCollapsed] = useState(false);

    // input del usuario
    const [inputValue, setInputValue] = useState('');

    // popups
    const [clipAnchorRect, setClipAnchorRect] = useState<DOMRect | null>(null);
    const [dislikeAnchorRect, setDislikeAnchorRect] = useState<DOMRect | null>(null);
    const [dislikeMsgId, setDislikeMsgId] = useState<number | null>(null);
    const [functionsAnchorRect, setFunctionsAnchorRect] = useState<DOMRect | null>(null);
    const [currentMsgId, setCurrentMsgId] = useState<number | null>(null);

    // popup generate para system message
    const [anchorRectGenerate, setAnchorRectGenerate] = useState<DOMRect | null>(null);

    // Ejemplo de times
    const timeData = {
        totalMs: '985ms',
        upTokens: '692t',
        downTokens: '31t',
        requestId: 'Request ID'
    };

    // Al presionar "Run"
    const handleSend = () => {
        if (inputValue.trim()) {
            // Mensaje de usuario
            const userMsg: ExtMessageData = {
                id: Date.now(),
                role: 'user',
                content: inputValue.trim(),
                originalContent: inputValue.trim()
            };
            setMessages(prev => [...prev, userMsg]);
            onAddHistory(userMsg);

            // Mensaje de assistant (simulado)
            const assistantMsg: ExtMessageData = {
                id: Date.now() + 1,
                role: 'assistant',
                content: `Assistant response to: "${inputValue.trim()}"`,
                originalContent: `Assistant response to: "${inputValue.trim()}"`
            };
            // Chequeamos si hay algún assistant con function data
            const hasFn = messages.find(m =>
                m.role === 'assistant' && m.functionJson && m.functionResponse
            );
            if (hasFn) {
                assistantMsg.content += `\n\n(Using function data: ${hasFn.functionJson}, response: ${hasFn.functionResponse})`;
                assistantMsg.originalContent = assistantMsg.content;
            }
            setMessages(prev => [...prev, assistantMsg]);
            onAddHistory(assistantMsg);

            setInputValue('');
        } else {
            // Si no hay texto => tomamos systemMessage
            const systemMsg: ExtMessageData = {
                id: Date.now(),
                role: 'assistant',
                content: systemMessage.trim() || '(System empty)',
                originalContent: systemMessage.trim()
            };
            const hasFn = messages.find(m =>
                m.role==='assistant' && m.functionJson && m.functionResponse
            );
            if(hasFn) {
                systemMsg.content += `\n\n(Using function data: ${hasFn.functionJson}, response: ${hasFn.functionResponse})`;
                systemMsg.originalContent = systemMsg.content;
            }
            setMessages(prev => [...prev, systemMsg]);
            onAddHistory(systemMsg);
        }
    };

    // Borrar un mensaje
    const handleDeleteMessage = (id: number) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    // Dislike => popup
    const handleToggleDislike = (id: number, e?: React.MouseEvent<HTMLButtonElement>) => {
        if (!e) {
            // si no hay evento, togglear normal
            setMessages(prev =>
                prev.map(m => (m.id === id ? { ...m, isDisliked: !m.isDisliked } : m))
            );
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setDislikeAnchorRect(rect);
        setDislikeMsgId(id);
    };
    const closeDislikePopup = () => {
        setDislikeAnchorRect(null);
        setDislikeMsgId(null);
    };

    // Convertir a JSON
    const handleToggleJSON = (id: number) => {
        setMessages(prev =>
            prev.map(m => {
                if (m.id === id) {
                    if (!m.isJson) {
                        const j = JSON.stringify(
                            { role: m.role, content: m.originalContent },
                            null, 2
                        );
                        return { ...m, content: j, isJson: true };
                    } else {
                        return { ...m, content: m.originalContent || '', isJson: false };
                    }
                }
                return m;
            })
        );
    };

    // Popup de Functions
    const handleOpenFunctionsPopup = (msgId: number, e: React.MouseEvent<HTMLButtonElement>) => {
        setCurrentMsgId(msgId);
        const rect = e.currentTarget.getBoundingClientRect();
        setFunctionsAnchorRect(rect);
    };
    const closeFunctionsPopup = () => {
        setFunctionsAnchorRect(null);
        setCurrentMsgId(null);
    };

    // Cuando el usuario selecciona una function
    const handleSelectFunction = (fn: IFunctionDef) => {
        if (!currentMsgId) return;
        setMessages(prev => prev.map(m => {
            if (m.id === currentMsgId) {
                return {
                    ...m,
                    functionJson: fn.jsonDefinition,
                    functionResponse: ''
                };
            }
            return m;
        }));
        closeFunctionsPopup();
    };

    // System generate
    const handleGenerateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setAnchorRectGenerate(rect);
    };
    const handleCloseGeneratePopup = () => {
        setAnchorRectGenerate(null);
    };
    const handleSubmitGeneratePopup = (newText: string) => {
        setSystemMessage(newText);
        setAnchorRectGenerate(null);
    };

    // Clip
    const handleClipClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setClipAnchorRect({ ...rect, top: rect.top - 120 });
    };
    const closeClipPopup = () => setClipAnchorRect(null);

    // Editar la function in-line
    const handleChangeFnJson = (id: number, newText: string) => {
        setMessages(prev => prev.map(m => {
            if (m.id === id) {
                return { ...m, functionJson: newText };
            }
            return m;
        }));
    };
    const handleChangeFnResp = (id: number, newText: string) => {
        setMessages(prev => prev.map(m => {
            if (m.id === id) {
                return { ...m, functionResponse: newText };
            }
            return m;
        }));
    };

    return (
        <ChatContainer>
            {/* System message */}
            <SystemMessageCard $collapsed={collapsed}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <SystemMessageHeader>System message</SystemMessageHeader>
                    <SystemMessageActions>
                        {!collapsed && (
                            <button
                                style={{
                                    background:'#00a37a',
                                    border:'none',
                                    color:'#fff',
                                    cursor:'pointer',
                                    borderRadius:'4px',
                                    padding:'0.3rem 0.5rem',
                                    marginRight:'0.75rem'
                                }}
                                onClick={handleGenerateClick}
                            >
                                Generate
                            </button>
                        )}
                        <SystemMessageToggleIcon onClick={() => setCollapsed(!collapsed)}>
                            {collapsed ? <FiEdit /> : <FiArrowUp />}
                        </SystemMessageToggleIcon>
                    </SystemMessageActions>
                </div>
                {!collapsed && (
                    <SystemMessageContent>
                        <SystemMessageTextarea
                            placeholder="Describe instructions..."
                            value={systemMessage}
                            onChange={e => setSystemMessage(e.target.value)}
                        />
                    </SystemMessageContent>
                )}
            </SystemMessageCard>

            {anchorRectGenerate && (
                <SystemGeneratePopup
                    anchorRect={anchorRectGenerate}
                    currentValue={systemMessage}
                    onClose={handleCloseGeneratePopup}
                    onSubmit={handleSubmitGeneratePopup}
                />
            )}

            {/* Lista de mensajes */}
            <MessagesContainer>
                {messages.map(msg => (
                    <FadeInMessage key={msg.id}>
                        <MessageBubble
                            message={msg}
                            onDelete={handleDeleteMessage}
                            onToggleDislike={handleToggleDislike}
                            onToggleJSON={handleToggleJSON}
                            onOpenFunctionsPopup={handleOpenFunctionsPopup}
                        />

                        {/* Si es assistant y tiene functionJson => mostramos 2 textareas */}
                        {msg.role === 'assistant' && msg.functionJson !== undefined && (
                            <div
                                style={{
                                    background:'#333',
                                    margin:'0.3rem 0 1rem 2rem',
                                    borderRadius:'8px',
                                    padding:'0.5rem'
                                }}
                            >
                                <div style={{ color:'#aaa', fontSize:'0.85rem', marginBottom:'0.3rem' }}>
                                    Function: (edit parameters)
                                </div>
                                <textarea
                                    style={{
                                        width:'100%',
                                        background:'#1f1f1f',
                                        border:'1px solid #444',
                                        borderRadius:'4px',
                                        color:'#fff',
                                        padding:'0.5rem',
                                        marginBottom:'0.5rem'
                                    }}
                                    rows={6}
                                    value={msg.functionJson}
                                    onChange={e => handleChangeFnJson(msg.id, e.target.value)}
                                />

                                <div style={{ color:'#aaa', fontSize:'0.85rem', marginBottom:'0.3rem' }}>
                                    RESPONSE
                                </div>
                                <textarea
                                    style={{
                                        width:'100%',
                                        background:'#1f1f1f',
                                        border:'1px solid #444',
                                        borderRadius:'4px',
                                        color:'#fff',
                                        padding:'0.5rem'
                                    }}
                                    rows={3}
                                    placeholder='Press tab to generate a response or enter one manually e.g. { "success": true }'
                                    value={msg.functionResponse || ''}
                                    onChange={e => handleChangeFnResp(msg.id, e.target.value)}
                                />
                            </div>
                        )}
                    </FadeInMessage>
                ))}
            </MessagesContainer>

            {/* Popup de funciones */}
            {functionsAnchorRect && currentMsgId && (
                <FunctionsPopup
                    anchorRect={functionsAnchorRect}
                    functionsList={functionsList}
                    onSelectFunction={handleSelectFunction}
                    onClose={() => {
                        setFunctionsAnchorRect(null);
                        setCurrentMsgId(null);
                    }}
                />
            )}

            {/* Popup de dislike */}
            {dislikeAnchorRect && dislikeMsgId && (
                <DislikeFeedbackPopup
                    anchorRect={dislikeAnchorRect}
                    onClose={() => {
                        setDislikeAnchorRect(null);
                        setDislikeMsgId(null);
                    }}
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
                    onChange={e => setInputValue(e.target.value)}
                />
                <BottomControls>
                    <LeftButtonsGroup>
                        <RectButton onClick={handleClipClick}>
                            <FiPaperclip />
                        </RectButton>
                        {clipAnchorRect && (
                            <AttachmentsPopup
                                anchorRect={clipAnchorRect}
                                onClose={closeClipPopup}
                            />
                        )}
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
