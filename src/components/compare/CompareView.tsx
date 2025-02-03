// src/components/compare/CompareView.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FiZap, FiArrowUp, FiArrowDown, FiClipboard,
    FiMoreHorizontal, FiSettings
} from 'react-icons/fi';
import { IMessageData } from '../chat/MessageBubble';
import CompareColumnMenu from './CompareColumnMenu';
import CompareColumnConfig from './CompareColumnConfig';
import { IFunctionDef } from '../../pages/PlaygroundPage';
import CompareViewCodeModal from './CompareViewCodeModal';

// Importamos las llamadas a la API
import { createChatCompletion, listModels } from '../../services/playgroundApi';

const CompareContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1;
    overflow: hidden;
    animation: fadeInCompare 0.4s ease forwards;

    @keyframes fadeInCompare {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
    }
`;

const Column = styled.div`
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

const RowLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ModelSelect = styled.select`
    background-color: #1f1f1f;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
`;

const RowRight = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const MessagesArea = styled.div`
    flex: 1;
    padding: 1rem;
    color: #ccc;
    overflow-y: auto;
`;

const Bubble = styled.div`
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

const Footer = styled.div`
    width: 100%;
    background-color: #2f2f2f;
    border-top: 1px solid #333;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const InputBox = styled.textarea`
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

const RunButton = styled.button`
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

interface CompareProps {
    leftMessages: IMessageData[];
    setLeftMessages: React.Dispatch<React.SetStateAction<IMessageData[]>>;
    rightMessages: IMessageData[];
    setRightMessages: React.Dispatch<React.SetStateAction<IMessageData[]>>;

    mainMessages: IMessageData[];
    setMainMessages: React.Dispatch<React.SetStateAction<IMessageData[]>>;
}

const CompareView: React.FC<CompareProps> = ({
                                                 leftMessages, setLeftMessages,
                                                 rightMessages, setRightMessages,
                                                 mainMessages, setMainMessages
                                             }) => {
    const [inputVal, setInputVal] = useState('');

    // Menús contextuales
    const [leftMenuAnchor, setLeftMenuAnchor] = useState<DOMRect | null>(null);
    const [rightMenuAnchor, setRightMenuAnchor] = useState<DOMRect | null>(null);

    // Popups config
    const [leftConfigAnchor, setLeftConfigAnchor] = useState<DOMRect | null>(null);
    const [rightConfigAnchor, setRightConfigAnchor] = useState<DOMRect | null>(null);

    // Modales view code
    const [leftCodeOpen, setLeftCodeOpen] = useState(false);
    const [rightCodeOpen, setRightCodeOpen] = useState(false);

    // Estados de config (columna izquierda)
    const [leftModel, setLeftModel] = useState('gpt-4');
    const [leftResponseFmt, setLeftResponseFmt] = useState('text');
    const [leftFunctions, setLeftFunctions] = useState<IFunctionDef[]>([]);
    const [leftTemp, setLeftTemp] = useState(1.0);
    const [leftMaxT, setLeftMaxT] = useState(2048);
    const [leftTopP, setLeftTopP] = useState(1.0);
    const [leftFreq, setLeftFreq] = useState(0);
    const [leftPres, setLeftPres] = useState(0);

    // Métricas (tiempo, tokens, requestId) col izq
    const [leftTiming, setLeftTiming] = useState({
        totalMs: 0,
        upTokens: 0,
        downTokens: 0,
        requestId: ''
    });

    // Estados de config (columna derecha)
    const [rightModel, setRightModel] = useState('gpt-4');
    const [rightResponseFmt, setRightResponseFmt] = useState('text');
    const [rightFunctions, setRightFunctions] = useState<IFunctionDef[]>([]);
    const [rightTemp, setRightTemp] = useState(1.0);
    const [rightMaxT, setRightMaxT] = useState(2048);
    const [rightTopP, setRightTopP] = useState(1.0);
    const [rightFreq, setRightFreq] = useState(0);
    const [rightPres, setRightPres] = useState(0);

    // Métricas col der
    const [rightTiming, setRightTiming] = useState({
        totalMs: 0,
        upTokens: 0,
        downTokens: 0,
        requestId: ''
    });

    // Lista de modelos
    const [models, setModels] = useState<{ id: string }[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [errorModels, setErrorModels] = useState<string | null>(null);

    // Al montar, cargar la lista de modelos
    useEffect(() => {
        async function fetchModels() {
            try {
                setLoadingModels(true);
                setErrorModels(null);
                const data = await listModels();
                setModels(data.data); // data.data => array de {id:'...', object:'model'}
            } catch (err: any) {
                setErrorModels(err.message);
            } finally {
                setLoadingModels(false);
            }
        }
        fetchModels();
    }, []);

    // Al iniciar, copia la conversación principal a ambos
    useEffect(() => {
        setLeftMessages(mainMessages);
        setRightMessages(mainMessages);
    }, [mainMessages, setLeftMessages, setRightMessages]);

    // Menús contextuales (puntos suspensivos)
    const handleLeftMenuClick = (e: React.MouseEvent<SVGElement>) => {
        setLeftMenuAnchor(e.currentTarget.getBoundingClientRect());
    };
    const handleRightMenuClick = (e: React.MouseEvent<SVGElement>) => {
        setRightMenuAnchor(e.currentTarget.getBoundingClientRect());
    };

    // Popups config (tuerca)
    const handleLeftConfigClick = (e: React.MouseEvent<SVGElement>) => {
        setLeftConfigAnchor(e.currentTarget.getBoundingClientRect());
    };
    const handleRightConfigClick = (e: React.MouseEvent<SVGElement>) => {
        setRightConfigAnchor(e.currentTarget.getBoundingClientRect());
    };

    // Acciones menú contextual
    const doLeftAction = (action: string) => {
        if (action === 'viewCode') {
            setLeftCodeOpen(true);
        } else if (action === 'sync') {
            // Copia los mensajes de la derecha
            setLeftMessages(rightMessages.map(m => ({ ...m, id: Date.now() + Math.random() })));
        } else if (action === 'clear') {
            setLeftMessages([]);
        } else if (action === 'moveRight') {
            setRightMessages([
                ...rightMessages,
                ...leftMessages.map(m => ({ ...m, id: Date.now() + Math.random() }))
            ]);
            setLeftMessages([]);
        }
        setLeftMenuAnchor(null);
    };

    const doRightAction = (action: string) => {
        if (action === 'viewCode') {
            setRightCodeOpen(true);
        } else if (action === 'sync') {
            setRightMessages(leftMessages.map(m => ({ ...m, id: Date.now() + Math.random() })));
        } else if (action === 'clear') {
            setRightMessages([]);
        } else if (action === 'moveLeft') {
            setLeftMessages([
                ...leftMessages,
                ...rightMessages.map(m => ({ ...m, id: Date.now() + Math.random() }))
            ]);
            setRightMessages([]);
        }
        setRightMenuAnchor(null);
    };

    // Al dar "Run", mandar el prompt a ambos
    const handleSend = async () => {
        if (!inputVal.trim()) return;

        // Mensaje user
        const userMsg: IMessageData = {
            id: Date.now(),
            role: 'user',
            content: inputVal.trim(),
            originalContent: inputVal.trim()
        };

        setLeftMessages(prev => [...prev, userMsg]);
        setRightMessages(prev => [...prev, userMsg]);
        setMainMessages(prev => [...prev, userMsg]);

        setInputVal('');

        // Left
        try {
            const { data, timeMs } = await createChatCompletion({
                model: leftModel,
                messages: [...leftMessages, userMsg].map(m => ({
                    role: m.role,
                    content: m.content
                })),
                temperature: leftTemp,
                max_tokens: leftMaxT,
                top_p: leftTopP,
                frequency_penalty: leftFreq,
                presence_penalty: leftPres
            });

            const leftResponse = data.choices?.[0]?.message?.content || '(sin respuesta)';
            const leftAsstMsg: IMessageData = {
                id: Date.now() + 100,
                role: 'assistant',
                content: leftResponse,
                originalContent: leftResponse
            };
            setLeftMessages(prev => [...prev, leftAsstMsg]);
            setMainMessages(prev => [...prev, leftAsstMsg]);

            const promptTokens = data.usage?.prompt_tokens || 0;
            const completionTokens = data.usage?.completion_tokens || 0;
            const respId = data.id || '';
            setLeftTiming({
                totalMs: timeMs,
                upTokens: promptTokens,
                downTokens: completionTokens,
                requestId: respId
            });
        } catch (error: any) {
            console.error("Error en la columna left:", error);
            const errMsg: IMessageData = {
                id: Date.now() + 101,
                role: 'assistant',
                content: "Error (left): " + error.message,
                originalContent: "Error (left): " + error.message
            };
            setLeftMessages(prev => [...prev, errMsg]);
            setMainMessages(prev => [...prev, errMsg]);
        }

        // Right
        try {
            const { data, timeMs } = await createChatCompletion({
                model: rightModel,
                messages: [...rightMessages, userMsg].map(m => ({
                    role: m.role,
                    content: m.content
                })),
                temperature: rightTemp,
                max_tokens: rightMaxT,
                top_p: rightTopP,
                frequency_penalty: rightFreq,
                presence_penalty: rightPres
            });

            const rightResponse = data.choices?.[0]?.message?.content || '(sin respuesta)';
            const rightAsstMsg: IMessageData = {
                id: Date.now() + 200,
                role: 'assistant',
                content: rightResponse,
                originalContent: rightResponse
            };
            setRightMessages(prev => [...prev, rightAsstMsg]);
            setMainMessages(prev => [...prev, rightAsstMsg]);

            const promptTokens = data.usage?.prompt_tokens || 0;
            const completionTokens = data.usage?.completion_tokens || 0;
            const respId = data.id || '';
            setRightTiming({
                totalMs: timeMs,
                upTokens: promptTokens,
                downTokens: completionTokens,
                requestId: respId
            });
        } catch (error: any) {
            console.error("Error en la columna right:", error);
            const errMsg: IMessageData = {
                id: Date.now() + 201,
                role: 'assistant',
                content: "Error (right): " + error.message,
                originalContent: "Error (right): " + error.message
            };
            setRightMessages(prev => [...prev, errMsg]);
            setMainMessages(prev => [...prev, errMsg]);
        }
    };

    return (
        <>
            <CompareContainer>
                {/* LEFT column */}
                <Column>
                    <TopBar>
                        <RowLeft>
                            {loadingModels && <div style={{ color: '#aaa' }}>Loading...</div>}
                            {errorModels && <div style={{ color: 'red' }}>{errorModels}</div>}
                            {!loadingModels && !errorModels && models.length > 0 && (
                                <ModelSelect
                                    value={leftModel}
                                    onChange={e => setLeftModel(e.target.value)}
                                >
                                    {models.map((m) => (
                                        <option key={m.id} value={m.id}>{m.id}</option>
                                    ))}
                                </ModelSelect>
                            )}
                            {models.length === 0 && !errorModels && !loadingModels && (
                                <ModelSelect disabled>
                                    <option>No models</option>
                                </ModelSelect>
                            )}
                        </RowLeft>
                        <RowRight>
                            <FiSettings style={{ cursor: 'pointer' }} onClick={handleLeftConfigClick} />
                            <FiMoreHorizontal style={{ cursor: 'pointer' }} onClick={handleLeftMenuClick} />
                        </RowRight>
                    </TopBar>

                    <MessagesArea>
                        {leftMessages.map((msg, idx) => (
                            <Bubble key={idx}>{`${msg.role}: ${msg.content}`}</Bubble>
                        ))}
                    </MessagesArea>

                    <TimingBar>
                        <div>
                            <FiZap/> {leftTiming.totalMs}ms
                        </div>
                        <div>
                            <FiArrowUp/> {leftTiming.upTokens}t
                        </div>
                        <div>
                            <FiArrowDown/> {leftTiming.downTokens}t
                        </div>
                        <div>
                            <FiClipboard/> {leftTiming.requestId || '---'}
                        </div>
                    </TimingBar>
                </Column>

                {/* RIGHT column */}
                <Column>
                    <TopBar>
                        <RowLeft>
                            {loadingModels && <div style={{ color: '#aaa' }}>Loading...</div>}
                            {errorModels && <div style={{ color: 'red' }}>{errorModels}</div>}
                            {!loadingModels && !errorModels && models.length > 0 && (
                                <ModelSelect
                                    value={rightModel}
                                    onChange={e => setRightModel(e.target.value)}
                                >
                                    {models.map((m) => (
                                        <option key={m.id} value={m.id}>{m.id}</option>
                                    ))}
                                </ModelSelect>
                            )}
                            {models.length === 0 && !errorModels && !loadingModels && (
                                <ModelSelect disabled>
                                    <option>No models</option>
                                </ModelSelect>
                            )}
                        </RowLeft>
                        <RowRight>
                            <FiSettings style={{ cursor: 'pointer' }} onClick={handleRightConfigClick} />
                            <FiMoreHorizontal style={{ cursor: 'pointer' }} onClick={handleRightMenuClick} />
                        </RowRight>
                    </TopBar>

                    <MessagesArea>
                        {rightMessages.map((msg, idx) => (
                            <Bubble key={idx}>{`${msg.role}: ${msg.content}`}</Bubble>
                        ))}
                    </MessagesArea>

                    <TimingBar>
                        <div>
                            <FiZap/> {rightTiming.totalMs}ms
                        </div>
                        <div>
                            <FiArrowUp/> {rightTiming.upTokens}t
                        </div>
                        <div>
                            <FiArrowDown/> {rightTiming.downTokens}t
                        </div>
                        <div>
                            <FiClipboard/> {rightTiming.requestId || '---'}
                        </div>
                    </TimingBar>
                </Column>
            </CompareContainer>

            <Footer>
                <InputBox
                    placeholder="Type your message and run in both..."
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                />
                <RunButton onClick={handleSend}>Run</RunButton>
            </Footer>

            {/* Menú contextual izq */}
            {leftMenuAnchor && (
                <CompareColumnMenu
                    anchorRect={leftMenuAnchor}
                    side="left"
                    onClose={() => setLeftMenuAnchor(null)}
                    onAction={doLeftAction}
                />
            )}
            {/* Menú contextual der */}
            {rightMenuAnchor && (
                <CompareColumnMenu
                    anchorRect={rightMenuAnchor}
                    side="right"
                    onClose={() => setRightMenuAnchor(null)}
                    onAction={doRightAction}
                />
            )}

            {/* Config popups */}
            {leftConfigAnchor && (
                <CompareColumnConfig
                    anchorRect={leftConfigAnchor}
                    side="left"
                    onClose={() => setLeftConfigAnchor(null)}
                    models={models}
                    loadingModels={loadingModels}
                    errorModels={errorModels}

                    model={leftModel} setModel={setLeftModel}
                    responseFormat={leftResponseFmt} setResponseFormat={setLeftResponseFmt}
                    functionsList={leftFunctions} setFunctionsList={setLeftFunctions}
                    temp={leftTemp} setTemp={setLeftTemp}
                    maxTokens={leftMaxT} setMaxTokens={setLeftMaxT}
                    topP={leftTopP} setTopP={setLeftTopP}
                    freqPenalty={leftFreq} setFreqPenalty={setLeftFreq}
                    presPenalty={leftPres} setPresPenalty={setLeftPres}
                />
            )}
            {rightConfigAnchor && (
                <CompareColumnConfig
                    anchorRect={rightConfigAnchor}
                    side="right"
                    onClose={() => setRightConfigAnchor(null)}
                    models={models}
                    loadingModels={loadingModels}
                    errorModels={errorModels}

                    model={rightModel} setModel={setRightModel}
                    responseFormat={rightResponseFmt} setResponseFormat={setRightResponseFmt}
                    functionsList={rightFunctions} setFunctionsList={setRightFunctions}
                    temp={rightTemp} setTemp={setRightTemp}
                    maxTokens={rightMaxT} setMaxTokens={setRightMaxT}
                    topP={rightTopP} setTopP={setRightTopP}
                    freqPenalty={rightFreq} setFreqPenalty={setRightFreq}
                    presPenalty={rightPres} setPresPenalty={setRightPres}
                />
            )}

            {/* View Code modals */}
            {leftCodeOpen && (
                <CompareViewCodeModal
                    side="left"
                    onClose={() => setLeftCodeOpen(false)}
                    messages={leftMessages}
                    model={leftModel}
                    responseFormat={leftResponseFmt}
                    tempValue={leftTemp}
                    maxTokens={leftMaxT}
                    topP={leftTopP}
                    freqPenalty={leftFreq}
                    presPenalty={leftPres}
                    functionsList={leftFunctions}
                />
            )}
            {rightCodeOpen && (
                <CompareViewCodeModal
                    side="right"
                    onClose={() => setRightCodeOpen(false)}
                    messages={rightMessages}
                    model={rightModel}
                    responseFormat={rightResponseFmt}
                    tempValue={rightTemp}
                    maxTokens={rightMaxT}
                    topP={rightTopP}
                    freqPenalty={rightFreq}
                    presPenalty={rightPres}
                    functionsList={rightFunctions}
                />
            )}
        </>
    );
};

export default CompareView;
