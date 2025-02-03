// src/components/chat/Chat.tsx

import React, { useState, useRef } from 'react';
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
import { createChatCompletion } from '../../services/playgroundApi';

interface IAssistantFnData {
    functionJson?: string;      // El JSON con la definición de la función
    functionResponse?: string;  // Lo que el usuario escribe como respuesta/resultado
}

type ExtMessageData = IMessageData & IAssistantFnData;

interface ChatProps {
    model: string;                // Modelo seleccionado (ej: "gpt-3.5-turbo")
    temperature: number;
    maxTokens: number;
    topP: number;
    freqPenalty: number;
    presPenalty: number;

    functionsList: IFunctionDef[];
    messages: ExtMessageData[];
    setMessages: React.Dispatch<React.SetStateAction<ExtMessageData[]>>;
    onAddHistory: (m: IMessageData) => void;
}

const Chat: React.FC<ChatProps> = ({
                                       model,
                                       temperature,
                                       maxTokens,
                                       topP,
                                       freqPenalty,
                                       presPenalty,
                                       functionsList,
                                       messages,
                                       setMessages,
                                       onAddHistory
                                   }) => {
    const [systemMessage, setSystemMessage] = useState('You are a helpful assistant...');
    const [collapsed, setCollapsed] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Popups (attachments, disliked, function selection, system generator)
    const [clipAnchorRect, setClipAnchorRect] = useState<DOMRect | null>(null);
    const [dislikeAnchorRect, setDislikeAnchorRect] = useState<DOMRect | null>(null);
    const [dislikeMsgId, setDislikeMsgId] = useState<number | null>(null);
    const [functionsAnchorRect, setFunctionsAnchorRect] = useState<DOMRect | null>(null);
    const [currentMsgId, setCurrentMsgId] = useState<number | null>(null);
    const [anchorRectGenerate, setAnchorRectGenerate] = useState<DOMRect | null>(null);

    // Métricas de tiempo/tokens
    const [timeData, setTimeData] = useState({
        totalMs: 0,
        upTokens: 0,
        downTokens: 0,
        requestId: ''
    });

    // Ref para el input de archivo (upload image)
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    /**
     * handleSend: se llama al pulsar "Run" para mandar un mensaje de usuario
     * y obtener la respuesta del modelo.
     */
    const handleSend = async () => {
        if (inputValue.trim()) {
            // Mensaje user
            const userMsg: ExtMessageData = {
                id: Date.now(),
                role: 'user',
                content: inputValue.trim(),
                originalContent: inputValue.trim()
            };
            setMessages(prev => [...prev, userMsg]);
            onAddHistory(userMsg);

            // Llamar a la API
            try {
                const { data, timeMs } = await createChatCompletion({
                    model,
                    messages: [
                        { role: "system", content: systemMessage },
                        { role: "user", content: userMsg.content }
                    ],
                    temperature,
                    max_tokens: maxTokens,
                    top_p: topP,
                    frequency_penalty: freqPenalty,
                    presence_penalty: presPenalty
                });

                const assistantResponse = data.choices?.[0]?.message?.content || "(sin respuesta)";
                const assistantMsg: ExtMessageData = {
                    id: Date.now() + 1,
                    role: "assistant",
                    content: assistantResponse,
                    originalContent: assistantResponse,
                };
                setMessages(prev => [...prev, assistantMsg]);
                onAddHistory(assistantMsg);

                // Métricas
                const promptTokens = data.usage?.prompt_tokens || 0;
                const completionTokens = data.usage?.completion_tokens || 0;
                const respId = data.id || '';

                setTimeData({
                    totalMs: timeMs,
                    upTokens: promptTokens,
                    downTokens: completionTokens,
                    requestId: respId
                });

            } catch (error: any) {
                console.error("Error en createChatCompletion", error);
                const errorMsg: ExtMessageData = {
                    id: Date.now() + 2,
                    role: "assistant",
                    content: "Error: " + error.message,
                    originalContent: "Error: " + error.message
                };
                setMessages(prev => [...prev, errorMsg]);
                onAddHistory(errorMsg);
            }

            setInputValue('');
        } else {
            // No hay input => mandar systemMessage
            const systemMsg: ExtMessageData = {
                id: Date.now(),
                role: 'assistant',
                content: systemMessage.trim() || '(System empty)',
                originalContent: systemMessage.trim()
            };
            setMessages(prev => [...prev, systemMsg]);
            onAddHistory(systemMsg);
        }
    };

    /** handleCallFunction: “function” role. */
    const handleCallFunction = async (msgId: number) => {
        const msg = messages.find(m => m.id === msgId);
        if (!msg || !msg.functionJson) return;

        try {
            const parsed = JSON.parse(msg.functionJson);
            const fnName = parsed.name || 'unnamed_function';
            const fnArgs = msg.functionResponse?.trim() || '{}';

            const conversation = [
                { role: 'system' as const, content: systemMessage },
                ...messages.map(m => ({
                    role: m.role as 'function'|'assistant'|'system'|'user',
                    content: m.originalContent || m.content
                })),
                {
                    role: 'function' as const,
                    name: fnName,
                    content: fnArgs
                }
            ];

            const { data, timeMs } = await createChatCompletion({
                model,
                messages: conversation,
                temperature,
                max_tokens: maxTokens,
                top_p: topP,
                frequency_penalty: freqPenalty,
                presence_penalty: presPenalty
            });

            const newAsstResponse = data.choices[0]?.message?.content || '(no final answer after function)';
            const newAsstMsg: ExtMessageData = {
                id: Date.now() + 999,
                role: 'assistant',
                content: newAsstResponse,
                originalContent: newAsstResponse
            };

            setMessages(prev => [...prev, newAsstMsg]);
            onAddHistory(newAsstMsg);

            const promptTokens = data.usage?.prompt_tokens || 0;
            const completionTokens = data.usage?.completion_tokens || 0;
            const respId = data.id || '';

            setTimeData({
                totalMs: timeMs,
                upTokens: promptTokens,
                downTokens: completionTokens,
                requestId: respId
            });

        } catch (err: any) {
            console.error("Error handleCallFunction:", err);
            const errorMsg: ExtMessageData = {
                id: Date.now() + 1000,
                role: "assistant",
                content: "Error (function call): " + err.message,
                originalContent: "Error (function call): " + err.message
            };
            setMessages(prev => [...prev, errorMsg]);
            onAddHistory(errorMsg);
        }
    };

    /** Event: user clicks "Delete" en un mensaje. */
    const handleDeleteMessage = (id: number) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    /** Toggle Dislike popup. */
    const handleToggleDislike = (id: number, e?: React.MouseEvent<HTMLButtonElement>) => {
        if (!e) {
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

    /** Toggle JSON. */
    const handleToggleJSON = (id: number) => {
        setMessages(prev =>
            prev.map(m => {
                if (m.id === id) {
                    if (!m.isJson) {
                        const j = JSON.stringify(
                            { role: m.role, content: m.originalContent },
                            null,
                            2
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

    /** Función popup: user clica "Open function selection" */
    const handleOpenFunctionsPopup = (msgId: number, e: React.MouseEvent<HTMLButtonElement>) => {
        setCurrentMsgId(msgId);
        const rect = e.currentTarget.getBoundingClientRect();
        setFunctionsAnchorRect(rect);
    };
    const closeFunctionsPopup = () => {
        setFunctionsAnchorRect(null);
        setCurrentMsgId(null);
    };

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

    /** System message "Generate" */
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

    /**
     * Manejo de icono "clip" -> abre AttachmentsPopup
     */
    const handleClipClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setClipAnchorRect({ ...rect, top: rect.top - 120 });
    };
    const closeClipPopup = () => setClipAnchorRect(null);

    /**
     * Link to image -> prompt user for URL -> add as user message
     */
    const handleLinkImage = () => {
        const url = window.prompt("Enter the image URL:");
        if (!url) return;
        // Agregamos un mensaje user que dice "User attached image link: X"
        const newMsg: ExtMessageData = {
            id: Date.now(),
            role: 'user',
            content: `[User attached an image link]: ${url}`,
            originalContent: `[User attached an image link]: ${url}`
        };
        setMessages(prev => [...prev, newMsg]);
        onAddHistory(newMsg);
    };

    /**
     * Upload image -> abrir file input -> al seleccionar, se añade un user message
     */
    const handleUploadImage = () => {
        if (!fileInputRef.current) return;
        fileInputRef.current.click();
    };

    /** onChange del input file */
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const newMsg: ExtMessageData = {
            id: Date.now(),
            role: 'user',
            content: `[User uploaded an image]: ${file.name}`,
            originalContent: `[User uploaded an image]: ${file.name}`
        };
        setMessages(prev => [...prev, newMsg]);
        onAddHistory(newMsg);

        // Limpia el valor del input
        e.target.value = '';
    };

    // Para functionJson / functionResponse
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
            {/* input file hidden */}
            <input
                type="file"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept="image/*"
            />

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

                        {/* Bloque para Assistant que tenga functionJson */}
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
                                    Function:
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
                                    placeholder='Ej: { "success": true }'
                                    value={msg.functionResponse || ''}
                                    onChange={e => handleChangeFnResp(msg.id, e.target.value)}
                                />

                                {/* Botón para llamar a la función => handleCallFunction */}
                                <div style={{marginTop:'0.5rem'}}>
                                    <button
                                        style={{
                                            background:'#00a37a',
                                            border:'none',
                                            color:'#fff',
                                            cursor:'pointer',
                                            borderRadius:'4px',
                                            padding:'0.3rem 0.5rem'
                                        }}
                                        onClick={()=> handleCallFunction(msg.id)}
                                    >
                                        Call function
                                    </button>
                                </div>
                            </div>
                        )}
                    </FadeInMessage>
                ))}
            </MessagesContainer>

            {/* Functions popup (para inyectar functionJson en un msg) */}
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

            {/* Dislike popup */}
            {dislikeAnchorRect && dislikeMsgId && (
                <DislikeFeedbackPopup
                    anchorRect={dislikeAnchorRect}
                    onClose={closeDislikePopup}
                />
            )}

            <TimingBar>
                <TimingIconBox>
                    <FiZap/> {timeData.totalMs}ms
                </TimingIconBox>
                <TimingIconBox>
                    <FiArrowUp/> {timeData.upTokens}t
                </TimingIconBox>
                <TimingIconBox>
                    <FiArrowDown/> {timeData.downTokens}t
                </TimingIconBox>
                <TimingIconBox>
                    <FiClipboard/> {timeData.requestId || '---'}
                </TimingIconBox>
            </TimingBar>

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
                                onLinkImage={handleLinkImage}
                                onUploadImage={handleUploadImage}
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
